import React, { Component } from "react";
import "./MenuBar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDoubleRight,
  faAngleRight,
  faAngleLeft,
  faAngleDoubleLeft,
  faSave,
  faAngleDown,
  faRedoAlt,
  faPrint,
  faArrowAltCircleRight,
} from "@fortawesome/free-solid-svg-icons";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

export default class MenuBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpen: false,
      anchorEl: null,
    };
  }
  render() {
    const { pageCount, pageNumber, exportKinds, zoomLevel, content, backTo } = this.props;
    const { menuOpen, anchorEl } = this.state;
    return (
      <div style={{ flex: "0 0 40px", display: "flex" }}>
        <div style={{ flex: "0 0 300px", display: "flex", alignItems: "center", justifyContent: "space-evenly" }}>
          <button
            style={pageNumber === 1 ? { cursor: "no-drop" } : null}
            disabled={pageNumber === 1 ? true : false}
            onClick={() => this.props.changePageNumber("first")}
            className={"buttonSave"}
          >
            <div className={"iconMenu"}>
              <FontAwesomeIcon title="صفحه اول" icon={faAngleDoubleRight} />
            </div>
          </button>
          <button
            style={pageNumber === 1 ? { cursor: "no-drop" } : null}
            disabled={pageNumber === 1 ? true : false}
            onClick={() => this.props.changePageNumber("pre")}
            className={"buttonSave"}
          >
            <div className={"iconMenu"}>
              <FontAwesomeIcon title="صفحه قبل" icon={faAngleRight} />
            </div>
          </button>
          <div style={{ flex: "0 0 70px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <input value={pageNumber} onChange={(e) => this.props.changePageNumber(e)} style={{ width: "40px" }} type="number"></input>
            <div>از {pageCount}</div>
          </div>
          <button
            disabled={pageNumber === pageCount ? true : false}
            style={pageNumber === pageCount ? { cursor: "no-drop" } : null}
            onClick={() => this.props.changePageNumber("next")}
            className={"buttonSave"}
          >
            <div className={"iconMenu"}>
              <FontAwesomeIcon title="صفحه بعد" icon={faAngleLeft} />
            </div>
          </button>
          <button
            disabled={pageNumber === pageCount ? true : false}
            style={pageNumber === pageCount ? { cursor: "no-drop" } : null}
            onClick={() => this.props.changePageNumber("last")}
            className={"buttonSave"}
          >
            <div className={"iconMenu"}>
              <FontAwesomeIcon title="صفحه آخر" icon={faAngleDoubleLeft} />
            </div>
          </button>
        </div>
        <div className={"vLine"}></div>
        <div className={"wrapper"}>
          <button className={"buttonSave"} style={{ justifyContent: "center" }} onClick={backTo}>
            <FontAwesomeIcon title="بازگشت" icon={faArrowAltCircleRight} style={{ color: "#424242", fontSize: "25px" }} />
          </button>
        </div>
        <div className={"vLine"}></div>
        <div className={"wrapper"}>
          <button className={"buttonSave"} onClick={this.props.reload} style={{ justifyContent: "center" }}>
            <FontAwesomeIcon title="بارگزاری مجدد" icon={faRedoAlt} style={{ color: "#424242", fontSize: "20px" }} />
          </button>
        </div>
        <div className={"vLine"}></div>
        <div className={"wrapper"}>
          <select style={{ width: "60px" }} value={zoomLevel} onChange={(e) => this.props.changeZoom(e)}>
            <option value={"0.25"}>25%</option>
            <option value={"0.50"}>50%</option>
            <option value={"0.75"}>75%</option>
            <option value={"1"}>100%</option>
            <option value={"1.25"}>125%</option>
            <option value={"1.50"}>150%</option>
            <option value={"1.75"}>175%</option>
            <option value={"2"}>200%</option>
            <option value={"5"}>500%</option>
          </select>
        </div>
        <div className={"vLine"}></div>
        {content.showExport && (
          <div style={{ flex: "0 0 80px", display: "flex", alignItems: "center", justifyContent: "space-evenly" }}>
            <button
              className={"buttonSave"}
              style={{ justifyContent: "space-evenly" }}
              onClick={(e) => this.setState({ menuOpen: true, anchorEl: e.currentTarget })}
            >
              <FontAwesomeIcon title="ذخیره" icon={faSave} style={{ color: "#424242", fontSize: "20px" }} />
              <FontAwesomeIcon icon={faAngleDown} style={{ color: "#616161", fontSize: "25px", marginTop: "7px" }} />
            </button>
            <Menu
              style={{ direction: "rtl" }}
              anchorEl={anchorEl}
              keepMounted
              open={menuOpen}
              onClose={() => this.setState({ menuOpen: false, anchorEl: null })}
            >
              {exportKinds.map((exp) => {
                return (
                  <MenuItem
                    value={exp.name}
                    onClick={() => {
                      this.setState({ menuOpen: false, anchorEl: null });
                      this.props.changeExportType(exp.name);
                    }}
                    style={{ fontFamily: "IRANSans-web" }}
                  >
                    {exp.title}
                  </MenuItem>
                );
              })}
            </Menu>
          </div>
        )}
        <div className={"vLine"}></div>
        <div className={"wrapper"}>
          <button onClick={this.props.print} className={"buttonSave"} style={{ justifyContent: "center" }}>
            <FontAwesomeIcon title="چاپ" icon={faPrint} style={{ color: "#424242", fontSize: "20px" }} />
          </button>
        </div>
        <div className={"vLine"}></div>
      </div>
    );
  }
}
