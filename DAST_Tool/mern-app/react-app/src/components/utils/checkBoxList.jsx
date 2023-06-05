import React from "react";
import CheckBox from "./checkBox";

const CheckBoxList = (props) => {
  const { list, handleChange } = props;
  return (
    <React.Fragment>
      <div className="container">
        <div className="row">
          {list.map((s) => {
            return (
              <div key={s.name} className={s.colSize}>
                <CheckBox
                  label={s.label}
                  id={s.name}
                  onChange={handleChange(s.name)}
                  checked={s.checked}
                />
              </div>
            );
          })}
        </div>
      </div>
    </React.Fragment>
  );
};

export default CheckBoxList;
