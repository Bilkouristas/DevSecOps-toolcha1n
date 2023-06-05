import React from "react";
import CheckBoxList from "./checkBoxList";
import Input from "./input";

const SpiderMenu = (props) => {
  const {
    spiderScanner,
    spiderMaxchildren,
    validateMaxChildren,
    spiderRecurse,
    spiderSubtreeonly,
    handleNumericChange,
    handleChange,
  } = props;

  if (spiderScanner) {
    return (
      <div className="form-group" style={{ marginTop: "2em" }}>
        <h4>Spider Options</h4>
        <div className="container">
          <div className="row">
            <div className="col-3">
              <Input
                name="spiderMaxchildren"
                value={spiderMaxchildren.toString()}
                useLabel={true}
                label="Max Children"
                type="number"
                placeholder=""
                onChange={handleNumericChange("spiderMaxchildren")}
                valid={validateMaxChildren(spiderMaxchildren)}
                errorMsg="Please enter a non-negative integer."
              />
            </div>
            <div className="col" style={{ marginTop: "4.5em" }}>
              <i>Set `Max Children` to 0 for unlimited children</i>
            </div>
          </div>
        </div>
        <CheckBoxList
          list={[
            {
              name: "spiderRecurse",
              label: "Recurse",
              colSize: "col-3",
              checked: spiderRecurse,
            },
            {
              name: "spiderSubtreeonly",
              label: "Subtree Only",
              colSize: "col",
              checked: spiderSubtreeonly,
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

export default SpiderMenu;
