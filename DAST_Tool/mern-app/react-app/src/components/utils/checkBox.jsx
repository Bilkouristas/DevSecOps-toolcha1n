import React from "react";

const CheckBox = (props) => {
  const { label, id, onChange, checked } = props;
  return (
    <div className="custom-control custom-checkbox mr-sm-2">
      <input
        type="checkbox"
        className="custom-control-input"
        onChange={onChange}
        id={id}
        checked={checked}
      />
      <label className="custom-control-label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
};

export default CheckBox;
