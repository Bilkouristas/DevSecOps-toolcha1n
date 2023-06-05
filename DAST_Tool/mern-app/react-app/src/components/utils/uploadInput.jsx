import React from "react";

const UploadInput = (props) => {
  const {
    labelid,
    label,
    spanid,
    spanlabel,
    accept,
    onChange,
    uploadid,
    filename,
  } = props;
  return (
    <React.Fragment>
      <label
        style={{ marginBottom: "1em" }}
        className="form-check-label"
        htmlFor={labelid}
      >
        {label}
      </label>
      <div className="form-group" style={{ marginBottom: "2em" }}>
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text" id={spanid}>
              {spanlabel}
            </span>
          </div>
          <div className="custom-file">
            <input
              type="file"
              accept={accept}
              onChange={onChange}
              className="custom-file-input"
              id={uploadid}
              aria-describedby="inputGroupFileAddon01"
            />
            <label className="custom-file-label" htmlFor={uploadid}>
              {filename ? filename : "Choose File"}
            </label>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default UploadInput;
