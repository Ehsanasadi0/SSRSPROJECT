import React, { Component } from "react";
import "./App.css";
import DatePicker from "react-datepicker-enhanced";
import moment from "moment-jalaali";
//import MultiSelect from "react-multi-select-component";
import Select from "react-select";
import { components } from "react-select";
import persianjs from "persianjs";

export default class Parameter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gregorian: false,
      value: "",
      multiValue: [],
    };
    if (this.props.parameter.datePicker || this.props.rsParameter.ParameterTypeName === "DateTime")
      if (this.props.param[this.props.parameter.name] == null) this.state.value = undefined;
      else this.state.value = moment(this.props.param[this.props.parameter.name], this.props.parameter.dateFormat);
  }
  render() {
    const { parameter, changeParameter, param, rsParameter, checkNull } = this.props;
    const { gregorian, value } = this.state;
    let { multiValue } = this.state;
    let valid = [];
    if ((rsParameter.ValidValues != null || rsParameter.ValidValuesQueryBased) && !rsParameter.MultiValue)
      return (
        <select
          style={{ flex: 1 }}
          value={param[parameter.name]}
          onChange={changeParameter}
          variant="outlined"
          disabled={rsParameter.ParameterStateName === "HasOutstandingDependencies" ? true : checkNull[parameter.name] === true ? true : false}
        >
          <option value={""}> انتخاب کنید ... </option>
          {rsParameter.ValidValues != null &&
            rsParameter.ValidValues.map((q) => <option value={q.Value}>{q.Label ? persianjs(q.Label).englishNumber().toString() : q.Label}</option>)}
        </select>
      );
    /*  if ((rsParameter.ValidValues != null || rsParameter.ValidValuesQueryBased) && rsParameter.MultiValue) {
      multiValue = [];
      if(rsParameter.ValidValues){
        rsParameter.ValidValues.forEach((element) => {
          valid.push({ value: element.Value, label: element.Label });
          if (param[parameter.name].includes(element.Value)) {
            multiValue.push({ value: element.Value, label: element.Label });
          }
        });
      } 
      return (
        <MultiSelect
          style={{ width: "100%" }}
          onChange={(multiValue) => {
            changeParameter(multiValue);
            this.setState({ multiValue });
          }}
          value={multiValue}
          options={valid}
          labelledBy={"Select"}
          overrideStrings={{
            selectSomeItems: "انتخاب",
            allItemsAreSelected: "تمام گزینه ها انتخاب شده است",
            selectAll: "انتخاب همه",
            search: "جستجو",
            clearSearch: "حذف جستجو",
          }}
          className={"multi-select"}
        />
      );
    } */
    if ((rsParameter.ValidValues != null || rsParameter.ValidValuesQueryBased) && rsParameter.MultiValue) {
      multiValue = [];
      if (rsParameter.ValidValues) {
        valid.push({ value: "all", label: "انتخاب همه" });
        rsParameter.ValidValues.forEach((element) => {
          valid.push({ value: element.Value, label: element.Label });
          if (param[parameter.name] && param[parameter.name].includes(element.Value)) {
            multiValue.push({ value: element.Value, label: element.Label });
          }
        });
      }
      const Option = (props) => {
        return (
          <div>
            <components.Option {...props}>
              <input type="checkbox" checked={props.isSelected} onChange={() => null} /> <label>{props.label}</label>
            </components.Option>
          </div>
        );
      };
      const ValueContainer = ({ children, ...props }) => {
        let [values, input] = children;
        if (Array.isArray(values)) {
          const val = (i = Number) => values[i].props.children;
          const { length } = values;
          values = persianjs(` ${length} مورد انتخاب شده است  `).englishNumber().toString();
        }
        return (
          <components.ValueContainer {...props}>
            {values}
            {input}
          </components.ValueContainer>
        );
      };
      return (
        <div style={{ width: "100%" }}>
          <Select
            closeMenuOnSelect={false}
            placeholder={"انتخاب کنید..."}
            isSearchable
            isMulti
            options={valid}
            onChange={(event) => {
              //if (event.findIndex((option) => option.value === "all") > -1) multiValue = valid.slice(1);
              //else multiValue = event;
              if (event.findIndex((option) => option.value === "all") > -1) {
                if (multiValue == null) multiValue = valid.slice(1);
                else if (multiValue && multiValue.length < valid.length - 1) multiValue = valid.slice(1);
                else if (multiValue && multiValue.length === valid.length - 1) multiValue = [];
              } else multiValue = event;
              this.setState({ multiValue }, () => changeParameter(multiValue));
            }}
            value={multiValue}
            components={{ Option, ValueContainer }}
            hideSelectedOptions={false}
            style={{ width: "100%" }}
          />
        </div>
      );
    }
    if (parameter.datePicker || rsParameter.ParameterTypeName === "DateTime")
      if (parameter.showDateKind)
        return [
          <div style={{ flex: 1 }}>
            <DatePicker
              key="date"
              disabled={rsParameter.ParameterStateName === "HasOutstandingDependencies" ? true : checkNull[parameter.name] === true ? true : false}
              isGregorian={gregorian}
              timePicker={false}
              value={value}
              onChange={(value) => {
                changeParameter(value);
                this.setState({ value });
              }}
            />
          </div>,
          <button key="date_button" className={"buttonDate"} value={gregorian} onClick={() => this.setState({ gregorian: !gregorian })}>
            {gregorian && <span style={{ padding: "5px" }}>شمسی</span>}
            {!gregorian && <span style={{ padding: "5px" }}>میلادی</span>}
          </button>,
        ];
      else
        return (
          <div style={{ flex: 1 }}>
            <DatePicker
              key="date"
              disabled={rsParameter.ParameterStateName === "HasOutstandingDependencies" ? true : checkNull[parameter.name] === true ? true : false}
              isGregorian={gregorian}
              timePicker={false}
              value={value}
              onChange={(value) => {
                changeParameter(value);
                this.setState({ value });
              }}
            />
          </div>
        );

    if (rsParameter.ParameterTypeName === "Boolean")
      return (
        <select
          style={{ flex: 1 }}
          value={param[parameter.name]}
          onChange={changeParameter}
          variant="outlined"
          disabled={rsParameter.ParameterStateName === "HasOutstandingDependencies" ? true : checkNull[parameter.name] === true ? true : false}
        >
          <option value={true}> درست </option>
          <option value={false}> نادرست </option>
        </select>
      );

    return (
      <input
        style={{ flex: 1 }}
        value={param[parameter.name]}
        onChange={changeParameter}
        disabled={rsParameter.ParameterStateName === "HasOutstandingDependencies" ? true : checkNull[parameter.name] === true ? true : false}
        type={rsParameter.ParameterTypeName === "Integer" || rsParameter.ParameterTypeName === "Float" ? "number" : "text"}
      />
    );
  }
}
