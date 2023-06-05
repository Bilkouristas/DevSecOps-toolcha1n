import React, { Component } from "react";
import Axios from "axios";
import Input from "./utils/input";
import MultipleInputs from "./utils/multipleInputs";
import SeleniumMenu from "./utils/seleniumMenu";
import CheckBoxList from "./utils/checkBoxList";
import { toast } from "react-toastify";
import SpiderMenu from "./utils/spiderMenu";
import AjaxMenu from "./utils/ajaxMenu";
import AscanMenu from "./utils/ascanMenu";
import config from "../config.json";

class FormPage extends Component {
  state = {
    url: "",
    includeURLs: [],
    excludeURLs: [],
    seleniumTester: false,
    seleniumBrowser: "Mozilla Firefox",
    seleniumHeadless: false,
    seleniumTestFile: null,
    spiderScanner: false,
    spiderMaxchildren: 0,
    spiderRecurse: true,
    spiderSubtreeonly: false,
    ajaxSpiderScanner: false,
    ajaxSubtreeonly: false,
    ajaxTimeout: 1,
    activeScanner: false,
    ascanRecurse: true,
    submitClicked: false,
  };

  /* Multiple Input Handlers */
  handleEndpoint = (textFieldArray, arrayName, input) => (e) => {
    let copyArray = [...textFieldArray];
    copyArray[input] = e.target.value;
    // console.log(copyArray[input]);
    this.setState({
      [arrayName]: copyArray,
    });
  };

  handleAddEndpoint = (textFieldArray, arrayName) => (e) => {
    e.preventDefault();
    let copyArray = textFieldArray.concat([""]);
    this.setState({
      [arrayName]: copyArray,
    });
  };

  handleRemoveEndpoint = (textFieldArray, arrayName, input) => (e) => {
    e.preventDefault();
    let copyArray = [
      ...textFieldArray.slice(0, input),
      ...textFieldArray.slice(input + 1),
    ];
    this.setState({
      [arrayName]: copyArray,
    });
  };
  /* Multiple Input Handlers */

  /* Other Handlers */
  handleChange = (input) => (e) => {
    // console.log(input);
    let value;
    if (e.target.type === "checkbox") {
      value = e.target.checked;
    } else {
      value = e.target.value;
    }
    // console.log(value);
    // console.log(this.state);
    this.setState({ [input]: value });
  };

  handleNumericChange = (input) => (e) => {
    // console.log(input);
    let value;
    value = parseInt(e.target.value);
    // console.log(value);
    // console.log(this.state);
    this.setState({ [input]: value });
  };

  handleFileUpload = (e) => {
    this.setState({
      seleniumTestFile: e.target.files[0] ? e.target.files[0] : null,
    });
    // console.log(e.target.files[0].name);
  };
  /* Handle simple input or checkbox change */

  /* Validation */
  validateURL = (url) => {
    return url.match(new RegExp(/^http[s]*:\/\/.*/g)) || url === "";
  };

  validatePosInt = (value) => {
    return value >= 0 && value <= 2147483647 && Number.isInteger(value);
  };
  /* Validation */

  /* Submit Handlers */
  handleSubmit = async (e) => {
    e.preventDefault();
    // console.log(this.state);
    this.setState({ submitClicked: true });

    if (this.state.url === "") {
      toast.error("Please provide a target URL address.");
      this.setState({ submitClicked: false });
      return;
    }

    if (!this.validateURL(this.state.url)) {
      this.setState({ submitClicked: false });
      toast.error("Invalid target URL address!");
      return;
    }

    if (!this.validatePosInt(this.state.spiderMaxchildren)) {
      this.setState({ submitClicked: false });
      toast.error("Invalid spider maxChildren input!");
      return;
    }

    if (!this.validatePosInt(this.state.ajaxTimeout)) {
      this.setState({ submitClicked: false });
      toast.error("Invalid Ajax spider timeout input!");
      return;
    }

    try {
      if (this.state.seleniumTester) await this.uploadFile();
      const { data } = await this.getReport();
      toast.success(`Success! Report _id: ${data}`);
    } catch (err) {
      toast.error(err.message);
    }
    this.setState({ submitClicked: false });
  };

  uploadFile = async () => {
    try {
      const filedata = new FormData();
      filedata.append("file", this.state.seleniumTestFile);

      const response = await Axios.post(
        `${
          process.env.REACT_APP_API_ENDPOINT || config.REACT_APP_API_ENDPOINT
        }/api/reports/upload`,
        filedata,
        {
          header: {
            "Content-Type": "multipart/form-data",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
          },
        }
      );
      return response;
    } catch (err) {
      console.error(err);
      toast.error(err.response.data);
    }
  };

  getReport = async () => {
    const includedEndp = this.state.includeURLs
      .filter((el) => el.trim())
      .map((el) => {
        return this.state.url + el.trim();
      });

    const excludedEndp = this.state.excludeURLs
      .filter((el) => el.trim())
      .map((el) => {
        return this.state.url + el.trim();
      });

    let selenBrowser;

    if (this.state.seleniumBrowser === "Google Chrome") {
      selenBrowser = "chrome";
    } else if (this.state.seleniumBrowser === "Mozilla Firefox") {
      selenBrowser = "firefox";
    } else {
      selenBrowser = null;
    }

    const jsondata = {
      url: this.state.url,
      zapScans: {
        spider: this.state.spiderScanner,
        ajaxspider: this.state.ajaxSpiderScanner,
        activescan: this.state.activeScanner,
      },
      includeURLs: this.state.seleniumTester ? includedEndp : [],
      excludeURLs: excludedEndp,
      seleniumTest: {
        browser: selenBrowser,
        headless: this.state.seleniumHeadless,
        testPath:
          this.state.seleniumTester && this.state.seleniumTestFile
            ? true
            : false,
      },
      spiderOpt: this.state.spiderScanner
        ? {
            maxchildren: this.state.spiderMaxchildren,
            recurse: this.state.spiderRecurse,
            subtreeonly: this.state.spiderSubtreeonly,
          }
        : null,
      ajaxOpt: this.state.ajaxSpiderScanner
        ? {
            subtreeonly: this.state.ajaxSubtreeonly,
            ajaxTimeout: this.state.ajaxTimeout,
          }
        : null,
      ascanOpt: this.state.activeScanner
        ? { recurse: this.state.ascanRecurse }
        : null,
    };

    try {
      const response = await Axios.post(
        `${
          process.env.REACT_APP_API_ENDPOINT || config.REACT_APP_API_ENDPOINT
        }/api/reports/startscan`,
        jsondata,
        {
          header: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
          },
        }
      );
      return response;
    } catch (err) {
      console.error(err);
      toast.error(err.response.data);
    }
  };
  /* Submit Handlers */

  render() {
    const { url } = this.state;
    return (
      <main
        className="container"
        style={{ marginTop: "2em", marginBottom: "2em" }}
      >
        <div className="row">
          <div className="col" />
          <div className="col-8" align="left">
            <form>
              <Input
                name="url"
                value={this.state.url}
                useLabel={true}
                label="Target URL Address"
                type="url"
                placeholder="http(s)://(www.)example.com"
                onChange={this.handleChange("url")}
                valid={this.validateURL(url)}
                errorMsg="Please enter a valid target URL."
              />
              <CheckBoxList
                list={[
                  {
                    name: "seleniumTester",
                    label: "Selenium Test",
                    colSize: "col",
                  },
                  {
                    name: "spiderScanner",
                    label: "Spider Scan",
                    colSize: "col",
                  },
                  {
                    name: "ajaxSpiderScanner",
                    label: "AJAX Scan",
                    colSize: "col",
                  },
                  {
                    name: "activeScanner",
                    label: "Active Scan",
                    colSize: "col",
                  },
                ]}
                handleChange={this.handleChange}
              />
              <SeleniumMenu
                handleFileUpload={this.handleFileUpload}
                seleniumTestFile={this.state.seleniumTestFile}
                handleChange={this.handleChange}
                seleniumHeadless={this.state.seleniumHeadless}
                seleniumBrowser={this.state.seleniumBrowser}
                seleniumTester={this.state.seleniumTester}
                url={this.state.url}
                includeURLs={this.state.includeURLs}
                handleAddEndpoint={this.handleAddEndpoint}
                handleEndpoint={this.handleEndpoint}
                handleRemoveEndpoint={this.handleRemoveEndpoint}
              />
              <SpiderMenu
                spiderScanner={this.state.spiderScanner}
                spiderMaxchildren={this.state.spiderMaxchildren}
                spiderRecurse={this.state.spiderRecurse}
                spiderSubtreeonly={this.state.spiderSubtreeonly}
                validateMaxChildren={this.validatePosInt}
                handleNumericChange={this.handleNumericChange}
                handleChange={this.handleChange}
              />
              <AjaxMenu
                ajaxSpiderScanner={this.state.ajaxSpiderScanner}
                ajaxSubtreeonly={this.state.ajaxSubtreeonly}
                handleChange={this.handleChange}
                ajaxTimeout={this.state.ajaxTimeout}
                handleNumericChange={this.handleNumericChange}
                validatePosInt={this.validatePosInt}
              />
              <AscanMenu
                activeScanner={this.state.activeScanner}
                ascanRecurse={this.state.ascanRecurse}
                handleChange={this.handleChange}
              />

              <MultipleInputs
                url={this.state.url}
                textFieldArray={this.state.excludeURLs}
                arrayName="excludeURLs"
                labelText="Endpoints to exclude from scans (Default: No endpoint)"
                handleAddEndpoint={this.handleAddEndpoint}
                handleEndpoint={this.handleEndpoint}
                handleRemoveEndpoint={this.handleRemoveEndpoint}
              />
              <button
                style={{ marginTop: "1em" }}
                type="submit"
                className="btn btn-primary"
                onClick={this.handleSubmit}
                disabled={this.state.submitClicked ? true : false}
              >
                {this.state.submitClicked ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  <React.Fragment />
                )}
                Submit
              </button>
            </form>
          </div>
          <div className="col" />
        </div>
      </main>
    );
  }
}

export default FormPage;
