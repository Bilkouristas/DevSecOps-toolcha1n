import React from "react";
import CheckBoxList from "./checkBoxList";
import Input from "./input";

const AjaxMenu = (props) => {
  const {
    ajaxSpiderScanner,
    ajaxSubtreeonly,
    handleChange,
    ajaxTimeout,
    handleNumericChange,
    validatePosInt,
  } = props;

  if (ajaxSpiderScanner) {
    return (
      <div className="form-group" style={{ marginTop: "2em" }}>
        <h4 style={{ marginBottom: "1em" }}>AJAX Spider Options</h4>
        <div className="container">
          <div className="row">
            <div className="col-3">
              <Input
                name="ajaxTimeout"
                value={ajaxTimeout.toString()}
                useLabel={true}
                label="Max Scan Duration (in seconds)"
                type="number"
                placeholder=""
                onChange={handleNumericChange("ajaxTimeout")}
                valid={validatePosInt(ajaxTimeout)}
                errorMsg="Please enter a non-negative integer."
              />
            </div>
          </div>
        </div>
        <CheckBoxList
          list={[
            {
              name: "ajaxSubtreeonly",
              label: "Subtree Only",
              colSize: "col",
              checked: ajaxSubtreeonly,
            },
          ]}
          handleChange={handleChange}
        />
      </div>
    );
  } else {
    return null;
  }
};
export default AjaxMenu;
