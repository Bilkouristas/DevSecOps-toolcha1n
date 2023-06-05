import React from "react";

const MultipleInputs = (props) => {
  const {
    url,
    textFieldArray,
    arrayName,
    labelText,
    handleAddEndpoint,
    handleEndpoint,
    handleRemoveEndpoint,
  } = props;

  return (
    <React.Fragment>
      <div className="row" style={{ marginTop: "4em" }}>
        <div className="col">
          <label htmlFor={arrayName}>{labelText}</label>
        </div>
        <div align="right" style={{ marginBottom: "2em" }}>
          <button
            className="btn btn-primary"
            onClick={handleAddEndpoint(textFieldArray, arrayName)}
          >
            Add Endpoint <i className="fa fa-plus" aria-hidden="true" />
          </button>
        </div>
      </div>
      {textFieldArray.map((question, index) => (
        <span key={index}>
          <div className="form-group">
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text" id="basic-addon3">
                  {url}
                </span>
              </div>
              <input
                className="form-control"
                type="url"
                placeholder="/endpoint"
                onChange={handleEndpoint(textFieldArray, arrayName, index)}
                value={question}
              />
              <button
                className="btn btn-danger"
                onClick={handleRemoveEndpoint(textFieldArray, arrayName, index)}
              >
                Remove <i className="fa fa-trash" aria-hidden="true" />
              </button>
            </div>
          </div>
        </span>
      ))}
    </React.Fragment>
  );
};

export default MultipleInputs;
