import React from "react";

const Input = (props) => {
  const {
    name,
    value,
    useLabel,
    label,
    type,
    placeholder,
    useSpan,
    spanValue,
    onChange,
    valid,
    errorMsg,
  } = props;
  return (
    <div
      className="form-group"
      style={{ marginTop: "2em", marginBottom: "2em" }}
    >
      {useLabel ? <label htmlFor={name}>{label}</label> : <React.Fragment />}
      <div className="input-group mb-3">
        {useSpan ? (
          <div className="input-group-prepend">
            <span className="input-group-text" id="basic-addon3">
              {spanValue}
            </span>
          </div>
        ) : (
          <React.Fragment />
        )}
        <input
          type={type}
          value={value || ""}
          className={valid ? "form-control" : "form-control is-invalid"}
          id={label}
          placeholder={placeholder}
          onChange={onChange}
        />
        {valid ? (
          <React.Fragment />
        ) : (
          <div className="invalid-feedback">{errorMsg}</div>
        )}
      </div>
    </div>
  );
};

export default Input;
