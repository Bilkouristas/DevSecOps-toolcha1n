import React from "react";
import CheckBox from "./checkBox";

const SeleniumOptions = (props) => {
  const {
    onChange,
    onClickCheckbox,
    seleniumHeadless,
    seleniumBrowser,
  } = props;
  return (
    <div className="form-group">
      <div className="row">
        <div className="col-5">
          <label
            className="form-check-label"
            style={{ marginBottom: "1em" }}
            htmlFor="selectBrowser"
          >
            Choose Browser
          </label>
        </div>
      </div>

      <div className="row">
        <div className="col-6">
          <select
            className="form-control"
            defaultValue={seleniumBrowser}
            onChange={onChange}
          >
            <option>Mozilla Firefox</option>
            <option>Google Chrome</option>
          </select>
        </div>
        <div className="col" />
        <div className="col-5">
          <CheckBox
            label="Headless Browser"
            id="headless"
            onChange={onClickCheckbox}
            checked={seleniumHeadless}
          />
        </div>
      </div>
    </div>
  );
};

export default SeleniumOptions;
