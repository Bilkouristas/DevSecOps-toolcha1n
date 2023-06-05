import Axios from "axios";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import UploadInput from "./utils/uploadInput";
import CheckBox from "./utils/checkBox";
import Input from "./utils/input";
import config from "../config.json";

class ReportsPage extends Component {
  state = {
    url: "",
    spiderScanFile: null,
    ajaxScanFile: null,
    aScanpScanFile: null,
    ascanCheck: false,
    strAscanPscanRep: null,
    strAjaxScanRep: null,
    strSpiderScanRep: null,
    submitClicked: false,
    reports: [],
  };

  async componentDidMount() {
    try {
      const response = await Axios.get(
        `${
          process.env.REACT_APP_API_ENDPOINT || config.REACT_APP_API_ENDPOINT
        }/api/reports`,
        {
          header: {
            "Content-Type": "multipart/form-data",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
          },
        }
      );
      this.setState({ reports: response.data.reverse() });
    } catch (err) {
      console.error(err);
    }
  }

  validateURL = (url) => {
    return url.match(new RegExp(/^http[s]*:\/\/.*/g)) || url === "";
  };

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

  handleFileUpload = (file, report) => (e) => {
    this.setState({
      [file]: e.target.files[0] ? e.target.files[0] : null,
    });

    // console.log(e.target.files[0]);
    this.setState({ [report]: null });
    const reader = new FileReader();
    if (e.target.files.length > 0) {
      reader.onload = (event) =>
        this.setState({ [report]: event.target.result });
      // console.log("---> ", e.target.files);
      reader.readAsText(e.target.files[0]);
    }
  };

  handleSubmit = async () => {
    const prevState = this.state;

    try {
      const jsondata = {
        url: this.state.url,
        zapScans: {
          spider: this.state.spiderScanFile ? true : false,
          ajaxspider: this.state.ajaxScanFile ? true : false,
          activescan:
            this.state.ascanCheck && this.state.aScanpScanFile ? true : false,
        },
        spiderResults: this.state.strSpiderScanRep,
        ajaxSpiderResults: this.state.strAjaxScanRep,
        scanResults: this.state.strAscanPscanRep,
      };

      const response = await Axios.post(
        `${
          process.env.REACT_APP_API_ENDPOINT || config.REACT_APP_API_ENDPOINT
        }/api/reports/sendreport`,
        jsondata,
        {
          header: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
          },
        }
      );

      this.setState({ submitClicked: false });
      await this.componentDidMount();
      toast.success(`Success! Report _id: ${response.data}`);
    } catch (err) {
      this.setState(prevState);
      console.error(err);
      toast.error(err.response.data);
    }
  };

  browserIcon = (browser) => {
    if (browser === "firefox") {
      return "fa fa-firefox";
    } else if (browser === "chrome") {
      return "fa fa-chrome";
    }
    return "fa fa-question";
  };

  browserIconColor = (browser) => {
    if (browser === "firefox") {
      return "orange";
    } else if (browser === "chrome") {
      return "blue";
    }
    return "purple";
  };

  render() {
    const reports = this.state.reports;
    return (
      <React.Fragment>
        <div className="container" style={{ marginTop: "2em" }}>
          <h3>Upload Manual ZAP Report</h3>
          <div className="row">
            <div className="col" align="left">
              <Input
                name="url"
                value={this.state.url}
                useLabel={true}
                label="Target URL Address"
                type="url"
                placeholder="http(s)://(www.)example.com"
                onChange={this.handleChange("url")}
                valid={this.validateURL(this.state.url)}
                errorMsg="Please enter a valid target URL."
              />
            </div>
            <div className="col-2" />
          </div>
          <div className="row" align="left" style={{ marginTop: "1em" }}>
            <div className="col-7">
              <UploadInput
                accept=".json"
                onChange={this.handleFileUpload(
                  "spiderScanFile",
                  "strSpiderScanRep"
                )}
                labelid="uploadFile1"
                label="Upload a valid Spider Report."
                spanid="uploadFile1"
                spanlabel="Upload"
                uploadid="uploadFile1"
                filename={this.state.spiderScanFile?.name || ""}
              />
            </div>
          </div>
          <div className="row" align="left" style={{ marginTop: "1em" }}>
            <div className="col-7">
              <UploadInput
                accept=".json"
                onChange={this.handleFileUpload(
                  "ajaxScanFile",
                  "strAjaxScanRep"
                )}
                labelid="uploadFile2"
                label="Upload a valid AJAX Spider Report."
                spanid="uploadFile2"
                spanlabel="Upload"
                uploadid="uploadFile2"
                filename={this.state.ajaxScanFile?.name || ""}
              />
            </div>
            <div className="col-1" />
          </div>
          <div className="row" align="left" style={{ marginTop: "1em" }}>
            <div className="col-7">
              <UploadInput
                accept=".json"
                onChange={this.handleFileUpload(
                  "aScanpScanFile",
                  "strAscanPscanRep"
                )}
                labelid="uploadFile3"
                label="Upload a valid Active/Passive scan Report."
                spanid="uploadFile3"
                spanlabel="Upload"
                uploadid="uploadFile3"
                filename={this.state.aScanpScanFile?.name || ""}
              />
            </div>
            <div className="col-1" />
            <div className="col" style={{ marginTop: "3em" }}>
              <CheckBox
                label="Active Scan used"
                id="ascanCheck"
                onChange={this.handleChange("ascanCheck")}
                checked={this.state.ascanCheck}
              />
            </div>
            <div className="col-1">
              <button
                style={{ marginTop: "2.5em" }}
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
                ) : null}
                Submit
              </button>
            </div>
          </div>
        </div>

        <h3 style={{ marginTop: "2em" }}>Stored Reports</h3>
        <div className="container">
          <div className="row">
            <table
              className="table table-hover table-bordered table-striped"
              style={{ marginTop: "2em", marginBottom: "2em" }}
            >
              <thead>
                <tr align="center">
                  <th scope="col">#</th>
                  <th scope="col">Target URL</th>
                  <th scope="col">Spider Scan</th>
                  <th scope="col">AJAX Scan</th>
                  <th scope="col">Active Scan</th>
                  <th scope="col">Selenium Browser</th>
                  <th scope="col">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((rep) => {
                  return (
                    <tr key={reports.reverse().indexOf(rep) + 1}>
                      <th scope="row">{reports.reverse().indexOf(rep) + 1}</th>
                      <td>
                        <Link to={`/reports/${rep._id}`}>{rep.url}</Link>
                      </td>
                      <td align="center">
                        {rep.zapScans.spider ? (
                          <i
                            className="fa fa-check"
                            aria-hidden="true"
                            style={{ fontSize: "25px", color: "green" }}
                          />
                        ) : (
                          <i
                            className="fa fa-times"
                            aria-hidden="true"
                            style={{ fontSize: "25px", color: "red" }}
                          />
                        )}
                      </td>
                      <td align="center">
                        {rep.zapScans.ajaxspider ? (
                          <i
                            className="fa fa-check"
                            aria-hidden="true"
                            style={{ fontSize: "25px", color: "green" }}
                          />
                        ) : (
                          <i
                            className="fa fa-times"
                            aria-hidden="true"
                            style={{ fontSize: "25px", color: "red" }}
                          />
                        )}
                      </td>
                      <td align="center">
                        {rep.zapScans.activescan ? (
                          <i
                            className="fa fa-check"
                            aria-hidden="true"
                            style={{ fontSize: "25px", color: "green" }}
                          />
                        ) : (
                          <i
                            className="fa fa-times"
                            aria-hidden="true"
                            style={{ fontSize: "25px", color: "red" }}
                          />
                        )}
                      </td>
                      <td>
                        {rep.seleniumInfo.usage ? (
                          <i
                            className={this.browserIcon(
                              rep.seleniumInfo.browser
                            )}
                            aria-hidden="true"
                            style={{
                              fontSize: "25px",
                              color: this.browserIconColor(
                                rep.seleniumInfo.browser
                              ),
                            }}
                          />
                        ) : (
                          <i
                            className="fa fa-times"
                            aria-hidden="true"
                            style={{ fontSize: "25px", color: "red" }}
                          />
                        )}
                      </td>
                      <td>{new Date(rep.timestamp).toUTCString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default ReportsPage;
