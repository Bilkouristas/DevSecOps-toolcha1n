import Axios from "axios";
import React, { Component } from "react";
import config from "../config.json";
import wascidTable from "../wascidTable";

class Alert extends Component {
  state = {
    name: "",
    description: "",
    solution: "",
    wascid: "",
    risk: "",
    alertEntries: [],
  };

  async componentDidMount() {
    try {
      const response = await Axios.get(
        `${
          process.env.REACT_APP_API_ENDPOINT || config.REACT_APP_API_ENDPOINT
        }/api/reports/${this.props.match.params.id}/${
          this.props.match.params.name
        }/${this.props.match.params.risk}`,
        {
          header: {
            "Content-Type": "multipart/form-data",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
          },
        }
      );

      const {
        name,
        description,
        solution,
        wascid,
        risk,
        details,
      } = response.data;

      this.setState({
        name,
        description,
        solution,
        wascid,
        risk,
        alertEntries: details,
      });
    } catch (err) {
      console.error(err);
    }
  }

  render() {
    const warningColor = {
      "False Positive": "purple",
      Informational: "blue",
      Low: "yellow",
      Medium: "orange",
      High: "red",
    };
    return (
      <React.Fragment>
        <div
          className="container"
          style={{ marginTop: "2em", marginBottom: "2em" }}
        >
          <div className="row">
            <ul
              className="list-group"
              align="justify"
              style={{ margin: "1em" }}
            >
              <li className="list-group-item row d-flex">
                <div className="col">
                  <h3>Name</h3>
                </div>
                <div className="col">
                  <h3>WASC ID</h3>
                </div>
                <div className="col">
                  <h3>Risk</h3>
                </div>
              </li>
              <li className="list-group-item row d-flex">
                <div className="col">{this.state.name}</div>
                <div className="col">
                  {this.state.wascid} - {wascidTable[this.state.wascid]}
                </div>
                <div className="col">
                  <i
                    className="fa fa-exclamation-triangle"
                    style={{ color: warningColor[this.state.risk] }}
                  />
                  {this.state.risk}
                </div>
              </li>
              <li className="list-group-item row d-flex">
                <h3>Description</h3>
              </li>
              <li className="list-group-item row d-flex">
                {this.state.description}
              </li>
              <li className="list-group-item row d-flex">
                <h3>Solution</h3>
              </li>
              <li className="list-group-item row d-flex">
                {this.state.solution}
              </li>
            </ul>
          </div>
        </div>

        <div
          className="container"
          style={{ marginTop: "2em", marginBottom: "2em" }}
        >
          <div className="row">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Request</th>
                  <th scope="col">Evidence</th>
                  <th scope="col">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {this.state.alertEntries.map((alert) => {
                  return (
                    <tr key={this.state.alertEntries.indexOf(alert) + 1}>
                      <th scope="row">
                        {this.state.alertEntries.indexOf(alert) + 1}
                      </th>
                      <td align="left">{alert.method + " " + alert.url}</td>
                      <td align="left">{alert.evidence}</td>
                      <td>{alert.confidence}</td>
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

export default Alert;
