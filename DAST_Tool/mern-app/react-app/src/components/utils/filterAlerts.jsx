import React from "react";

function FilterAlerts(props) {
  return (
    <div className="container card p-1">
      <div
        className="row"
        style={{ marginTop: "0.5em", marginBottom: "0.5em" }}
      >
        <div className="col" />

        {props.showAlerts.map((categ) => {
          return (
            <div className="col" key={categ.id}>
              <div className="custom-control custom-switch">
                <input
                  type="checkbox"
                  checked={categ.checked}
                  onChange={props.onChange(categ.risk)}
                  className="custom-control-input"
                  id={categ.id}
                />
                <label className="custom-control-label" htmlFor={categ.id}>
                  <i
                    className="fa fa-exclamation-triangle"
                    style={{ color: categ.color }}
                  />
                  &nbsp; {categ.label}
                </label>
              </div>
            </div>
          );
        })}

        <div className="col" />
      </div>
    </div>
  );
}

export default FilterAlerts;
