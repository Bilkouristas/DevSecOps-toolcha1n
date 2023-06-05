import React from "react";
import MultipleInputs from "./multipleInputs";
import SeleniumOptions from "./seleniumOpt";
import UploadInput from "./uploadInput";

const SeleniumMenu = (props) => {
  const {
    handleFileUpload,
    seleniumTestFile,
    handleChange,
    seleniumHeadless,
    seleniumBrowser,
    seleniumTester,
    url,
    includeURLs,
    handleAddEndpoint,
    handleEndpoint,
    handleRemoveEndpoint,
  } = props;

  if (seleniumTester) {
    return (
      <div className="form-group" style={{ marginTop: "2em" }}>
        <h4 style={{ marginBottom: "1em" }}>Selenium Options</h4>
        <UploadInput
          accept=".js"
          onChange={handleFileUpload}
          labelid="uploadFile"
          label="Upload a valid selenium mocha js test"
          spanid="uploadFile"
          spanlabel="Upload"
          uploadid="uploadFile"
          filename={seleniumTestFile?.name || ""}
        />
        <SeleniumOptions
          onChange={handleChange("seleniumBrowser")}
          onClickCheckbox={handleChange("seleniumHeadless")}
          seleniumHeadless={seleniumHeadless}
          seleniumBrowser={seleniumBrowser}
        />
        <MultipleInputs
          url={url}
          textFieldArray={includeURLs}
          arrayName="includeURLs"
          labelText="Endpoints to limit the scans to (Default: All endpoints)"
          handleAddEndpoint={handleAddEndpoint}
          handleEndpoint={handleEndpoint}
          handleRemoveEndpoint={handleRemoveEndpoint}
        />
      </div>
    );
  } else {
    return null;
  }
};

export default SeleniumMenu;
