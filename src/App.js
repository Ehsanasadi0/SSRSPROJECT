import React, { Component } from "react";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";
import AppHubClient from "@parsahmd/bondad-hub-client";
import moment from "moment-jalaali";
import MenuBar from "./MenuBar";
import { grey } from "@material-ui/core/colors";
import Parameter from "./Parameter";
import { CircularProgress, LinearProgress } from "@material-ui/core";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clientId: null,
      item: "",
      result: "",
      hub: "http://localhost:80",
      navigationSource: "",
      rowGrid: "",
      columnGrid: "",
      parametersTemp: [],
      showParametersPanel: true,
      parametersFetch: [],
      currentPage: 1,
      totalPage: 1,
      row: 1,
      column: 1,
      exportKinds: [
        {
          name: "WORD",
          title: "فایل Word",
        },
        {
          name: "EXCEL",
          title: "اکسل XLS",
        },
        {
          name: "PPTX",
          title: "اسلاید PPTX",
        },
        {
          name: "PDF",
          title: "فایل PDF",
        },
        {
          name: "IMAGE",
          title: "تصویر TIFF",
        },
        {
          name: "MHTML",
          title: "آرشیو وب MHTML",
        },
        {
          name: "CSV",
          title: "فایل CSV",
        },
        {
          name: "XML",
          title: "فایل XML",
        },
      ],
      zoomLevel: "1",
      param: {},
      workingIntial: true,
      workingRender: false,
      paramCheckNull: {},
    };
    var path = window.location.href.split("?");
    if (path.length > 1) {
      var uParams = path[1].split("&");
      if (uParams.length > 0) this.state.clientId = uParams[0];
      if (uParams.length > 1) this.state.hub = uParams[1];
      if (uParams.length > 2) this.state.navigationSource = uParams[2];
      for (var i = 4; i < uParams.length; i++) this.state.param[uParams[i].split("=")[0]] = decodeURI(uParams[i].split("=")[1]);
    }

    this.state.hub = new AppHubClient(
      this.state.hub,
      {
        appClientId: this.state.clientId,
        sessionId: "7afe9925-e5d0-487e-8090-42efaa083213",
        token:
          "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJpc0FkbWluIjp0cnVlLCJncm91cHMiOltdLCJpcCI6IjEyNy4wLjAuMSIsImV4cCI6NjM3MjIwMjIyMjU0OTU5MzExfQ.sJ58i6EhdwPP1xjWuD1eILiy2e7VtnMab_8N0ZCxJeg",
      },
      [
        { name: "executeReport", service: "rsService" },
        { name: "getParameters", service: "rsService" },
        { name: "getValidValues", service: "rsService" },
        { name: "downloadReport", service: "rsService" },
        { name: "openFile", service: "workspaceService" },
        { name: "loadApp", kind: "ui", others: false },
        { name: "showMessage", kind: "ui", others: false },
        { name: "setBarTitle", kind: "ui", others: false },
        { name: "showUnloadAlert", kind: "ui", others: false },
        { name: "setBarActions", kind: "void" },
        { name: "changePath", kind: "ui", others: false },
      ],
      function (clientId) {
        this.getItem();
      }.bind(this)
    );
  }

  setActions = () => {
    var actions = [];
    var title = [
      {
        text: "کاوش",
        isLink: true,
        link: "ws-workspace?" + (this.state.item.root === null ? "" : this.state.item.root.id),
      },
      { text: "نمایش گزارش", isLink: false },
      { text: this.state.item.name, isLink: false },
    ];
    this.state.hub.setBarTitle(title);
    this.state.hub.setBarActions(actions);
  };

  //read File from service

  getItem = () => {
    const { hub, navigationSource } = this.state;
    hub.openFile(decodeURI(navigationSource)).then((item) => {
      item.content = JSON.parse(item.content);
      if (item.content === null) {
        this.setState({ item, workingIntial: false }, () => {
          this.setActions();
        });
      } else {
        this.setState({ item }, () => {
          this.setActions();
          this.getParameters().then(() => {
            this.renderReport();
          });
        });
      }
    });
  };

  //read parameters from server using path

  getParameters = () => {
    const { hub, item, param, paramCheckNull } = this.state;
    var that = this;
    return new Promise(function (resolve, reject) {
      hub
        .getParameters({
          filePath: item.content.filePath,
          parameters: param,
          forRendering: true,
          hiddenParams: item.content.parameters.filter((p) => p.hidden).map((p) => p.name),
        })
        .then((parametersFetch) => {
          that.setState({ parametersFetch }, () => {
            parametersFetch.forEach((par) => {
              if (par.MultiValue)
                param[par.Name] =
                  par.DefaultValues == null || par.DefaultValues.length === 0
                    ? []
                    : par.ValidValuesQueryBased
                    ? par.DefaultValues
                    : par.DefaultValues.join(",");
              else {
                param[par.Name] =
                  par.DefaultValues == null || par.DefaultValues.length === 0 || par.DefaultValues[0] == null ? null : par.DefaultValues.join(",");
                paramCheckNull[par.Name] =
                  par.Nullable && paramCheckNull[par.Name] !== true ? false : par.Nullable && par.DefaultValues[0] == null ? true : null;
              }
            });
            that.setState({ param, paramCheckNull, workingIntial: false });
            resolve();
          });
        })
        .catch((ex) => reject(ex));
    });
  };

  //adding missing props to parameters list

  changeParameter = (name, dateFormat, allowBlank, multiValue) => (e) => {
    let { param } = this.state;
    let selected = [];
    if (multiValue) {
      if (e.target == null) {
        selected = e;
        param[name] = [];
        selected.forEach((element) => {
          param[name].push(element.value);
        });
        this.setState({ param }, () => (selected && selected.length > 0 ? this.getParameters() : null));
      } else {
        param[name] = e.target.value;
        if (e.target.value.charAt(e.target.value.length - 1) === " " || e.target.value.charAt(e.target.value.length - 1) === ",")
          this.setState({ param });
        else this.setState({ param }, () => this.getParameters());
      }
    } else {
      param[name] = e.target == null ? e : e.target.value;
      if (param[name] === "" && !allowBlank) {
        param[name] = [];
      }
      if (e.target == null) param[name] = moment(param[name]).format(dateFormat);
      this.setState({ param }, () => this.getParameters());
    }
  };

  handleNull = (name, allowBlank) => (e) => {
    let { param, paramCheckNull } = this.state;
    paramCheckNull[name] = e.target.checked;
    if (paramCheckNull[name] === true) param[name] = null;
    if (paramCheckNull[name] === false) param[name] = "";
    if (param[name] === "" && !allowBlank) {
      param[name] = [];
    }
    this.setState({ param, paramCheckNull }, () => this.getParameters());
  };

  //render the report using parameters

  renderReport = (pageNumber) => {
    const { parametersFetch, hub, item, currentPage, navigationSource } = this.state;
    let { param } = this.state;
    let num = pageNumber ? pageNumber : currentPage;
    for (var i = 0; i < parametersFetch.length; i++) {
      if (parametersFetch[i].Prompt !== "" && parametersFetch[i].ParameterStateName !== "HasValidValue") return;
    }
    if (pageNumber) this.setState({ currentPage: pageNumber });
    this.setState({ workingRender: true, result: "" });
    hub.executeReport({ filePath: item.content.filePath, parameters: param, count: parametersFetch.length, pageNum: num }).then((result) => {
      var meta = `<META HTTP-EQUIV="Location" CONTENT="`; //prefix of location
      var posMetaStart = result.report.indexOf(meta) + meta.length; //first charoctor of location
      var posMetaEnd = result.report.substring(posMetaStart).indexOf(`"`);
      var metaContent = result.report.slice(posMetaStart, posMetaEnd + posMetaStart); // get location
      var imageIds = Object.keys(result.img); //get streamIds
      var imageUri = "";
      imageIds.forEach((id) => {
        imageUri = encodeURI(`&rs:SessionID=${result.extId}&rs:Format=HTML5&rs:ImageID=${id}`);
        imageUri = imageUri.replace(/:/g, "%3A");
        imageUri = metaContent + imageUri; // making URI
        while (result.report.indexOf(imageUri) !== -1) {
          result.report = result.report.replace(imageUri, result.img[id]);
        }
      });
      var path = `/app/rs-render?${navigationSource}&1`;
      item.content.parameters.forEach((par) => {
        path += "&" + par.name + "=" + param[par.name];
      });
      hub.changePath(path);
      this.setState({ result, totalPage: Number(result.pageCount), workingRender: false });
    });
  };

  reload = () => {
    const { parametersFetch, hub, item, param } = this.state;
    this.setState({ workingRender: true, result: "" });
    hub.executeReport({ filePath: item.content.filePath, parameters: param, count: parametersFetch.length, pageNum: 1 }).then((result) => {
      this.setState({ totalPage: Number(result.pageCount), currentPage: 1 });
      this.setState({ result, workingRender: false });
    });
  };

  //change the page Number

  changePageNumber = (e) => {
    let { currentPage, totalPage, result } = this.state;
    if (e === "next") {
      currentPage++;
    } else if (e === "pre") {
      currentPage--;
    } else if (e === "first") {
      currentPage = 1;
    } else if (e === "last") {
      if (Number(totalPage) > 0) {
        currentPage = Number(totalPage);
      }
    } else {
      currentPage = e.target.value;
    }
    if (currentPage < 1 || currentPage > Number(totalPage)) {
      currentPage = 1;
    }
    this.setState({ currentPage }, () => {
      if (result.report) {
        this.renderReport();
      }
    });
  };

  //change export type

  changeExportType = (name) => {
    let { exportKinds, exportElement } = this.state;
    exportKinds.forEach((exp) => {
      if (exp.name === name) exportElement = exp;
    });
    this.setState({ exportElement }, () => this.downloadReport());
  };

  //download report

  downloadReport = () => {
    const { exportElement, hub, parametersFetch, item, param } = this.state;
    this.setState({ workingIntial: true }, () => {
      hub
        .downloadReport({
          filePath: item.content.filePath,
          format: exportElement.name,
          parameters: param,
          count: parametersFetch.length,
          title: item.name,
        })
        .then((download) => {
          var data = download.content;
          data = window.atob(data);
          var buf = new ArrayBuffer(data.length);
          var view = new Uint8Array(buf);
          for (var i = 0; i !== data.length; ++i) view[i] = data.charCodeAt(i);
          var blob = new Blob([buf], { type: "" });
          var a = document.createElement("a");
          a.href = window.URL.createObjectURL(blob);
          a.download = download.name;
          a.click();
          this.setState({ workingIntial: false });
        });
    });
  };

  printReport = () => {
    const { hub, parametersFetch, item, param } = this.state;
    this.setState({ workingIntial: true }, () => {
      hub
        .downloadReport({
          filePath: item.content.filePath,
          format: "PDF",
          parameters: param,
          count: parametersFetch.length,
          title: item.name,
        })
        .then((download) => {
          var data = download.content;
          data = window.atob(data);
          var buf = new ArrayBuffer(data.length);
          var view = new Uint8Array(buf);
          for (var i = 0; i !== data.length; ++i) view[i] = data.charCodeAt(i);
          var blob = new Blob([buf], { type: "application/pdf" });
          var a = document.createElement("a");
          a.href = window.URL.createObjectURL(blob);
          a.download = download.name;
          this.setState({ workingIntial: false });
          let myWindow = window.open(a.href);
          myWindow.focus();
          myWindow.print();
        });
    });
    //let param = {};
    /* parametersFetch.forEach((par) => {
      param.par.Name = par.value;
    }); */
  };

  //change zoom

  changeZoom = (e) => {
    this.setState({ zoomLevel: e.target.value });
  };

  backTo = () => {
    const { hub, item } = this.state;
    hub.loadApp("ws-workspace?" + (item.root === null ? "" : item.root.id));
  };

  keyUp = (event) => {
    if (event.keyCode === 13) this.renderReport(1);
  };

  render() {
    const {
      item,
      showParametersPanel,
      parametersFetch,
      currentPage,
      result,
      totalPage,
      exportKinds,
      zoomLevel,
      param,
      workingIntial,
      workingRender,
      paramCheckNull,
    } = this.state;
    return (
      <div
        style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflow: "hidden" }}
        onKeyDown={this.keyUp}
        tabIndex={0}
      >
        <div style={{ display: "flex", flexDirection: "column" }} className={"main"}>
          {workingIntial && <LinearProgress style={{ flex: "0 0 auto" }} variant="query" />}
          {item.content && showParametersPanel && item.content.showPanel && parametersFetch.length > 0 && (
            <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "row" }}>
              <div style={{ flex: 1, display: "grid", padding: 5, gridTemplateRows: item.content.rowStr, gridTemplateColumns: item.content.colStr }}>
                {item.content.parameters
                  .filter((p) => p.prompt !== "")
                  .map((par, index) => {
                    const rsParameter = parametersFetch.find((p) => p.Name === par.name);
                    return (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                          gridColumn: `${par.parameterColumn} / ${par.parameterColumn}`,
                          gridRow: `${par.parameterRow} / ${par.parameterRow}`,
                          padding: rsParameter.MultiValue ? "0" : "5px",
                        }}
                      >
                        <div style={{ paddingRight: rsParameter.MultiValue ? "10px" : "5px", flex: "0 0 100px" }}>{par.prompt}</div>
                        {param[par.name] !== undefined && (
                          <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                            <Parameter
                              param={param}
                              checkNull={paramCheckNull}
                              parameter={par}
                              rsParameter={rsParameter}
                              changeParameter={this.changeParameter(par.name, par.dateFormat, rsParameter.AllowBlank, rsParameter.MultiValue)}
                            />
                          </div>
                        )}
                        {rsParameter.Nullable && (
                          <label style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 60px" }}>
                            خالی
                            <input
                              name="nullable"
                              type="checkbox"
                              checked={paramCheckNull[par.name]}
                              onChange={this.handleNull(par.name, rsParameter.AllowBlank)}
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
              </div>
              <div style={{ borderLeft: "0.5px dotted " + grey[500] }}></div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 100px" }}>
                <button style={{ fontSize: "12px", width: "100px" }} className={"buttonDate"} onClick={() => this.renderReport(1)}>
                  نمایش گزارش
                </button>
              </div>
            </div>
          )}
          {item.content && showParametersPanel && item.content.showPanel && parametersFetch.length > 0 && (
            <div
              style={{
                borderTop: "0.5px solid " + grey[700],
              }}
            ></div>
          )}
          {item.content && showParametersPanel && item.content.showPanel && parametersFetch.length > 0 && (
            <div style={{ flex: "0 0 7px", backgroundColor: grey[50], display: "flex", justifyContent: "center", alignItems: "center" }}>
              <button className={"icon"} onClick={() => this.setState({ showParametersPanel: false })}>
                <FontAwesomeIcon icon={faAngleUp} style={{ color: "white" }} />
              </button>
            </div>
          )}
          {item.content && !showParametersPanel && item.content.showPanel && parametersFetch.length > 0 && (
            <div style={{ flex: "0 0 8px", backgroundColor: grey[50], display: "flex", justifyContent: "center", alignItems: "center" }}>
              <button className={"icon"} onClick={() => this.setState({ showParametersPanel: true })}>
                <FontAwesomeIcon icon={faAngleDown} style={{ color: "white" }} />
              </button>
            </div>
          )}
          <div
            style={{
              borderTop: "1px solid " + grey[700],
            }}
          ></div>
          {workingRender && <CircularProgress style={{ flex: "0 0 auto", alignSelf: "center", padding: "5px" }} />}
          {item.content && result.report && (
            <MenuBar
              changePageNumber={this.changePageNumber}
              exportKinds={exportKinds}
              changeExportType={this.changeExportType}
              downloadReport={this.downloadReport}
              changeZoom={this.changeZoom}
              zoomLevel={zoomLevel}
              pageCount={result.pageCount ? Number(totalPage) : "؟"}
              pageNumber={currentPage}
              reload={this.reload}
              print={this.printReport}
              content={item.content}
              backTo={this.backTo}
            />
          )}
          {item.content && result.report && <div style={{ borderTop: "1px solid " + grey[700] }}></div>}
        </div>
        {item.content && result.report && (
          <div className={"report"} style={{ overflow: "auto", flex: 1, flexDirection: "column", display: "flex", alignItems: "flex-start" }}>
            <div
              style={{ flex: 1, transform: `scale(${zoomLevel})`, transformOrigin: "0% 0% 0px" }}
              dangerouslySetInnerHTML={{ __html: result.report }}
            ></div>
          </div>
        )}
      </div>
    );
  }
}
