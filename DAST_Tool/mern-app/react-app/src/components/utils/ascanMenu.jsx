import React from "react";
import CheckBoxList from "./checkBoxList";

const AscanMenu = (props) => {
  const { activeScanner, ascanRecurse, handleChange } = props;

  if (activeScanner) {
    return (
      <div className="form-group" style={{ marginTop: "2em" }}>
        <h4 style={{ marginBottom: "1em" }}>Active Scanner Options</h4>
        <CheckBoxList
          list={[
            {
              name: "ascanRecurse",
              label: "Recurse",
              colSize: "col",
              checked: ascanRecurse,
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
export default AscanMenu;
