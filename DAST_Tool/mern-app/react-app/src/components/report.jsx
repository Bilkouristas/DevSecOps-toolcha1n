import React, { Component } from "react";
import Axios from "axios";
import ListViolationCard from "./utils/listViolationCard";
import FilterAlerts from "./utils/filterAlerts";
import config from "../config.json";

class Report extends Component {
  state = {
    _id: "",
    spiderResults: [],
    ajaxSpiderResults: [],
    scanResults: [],
    showAlerts: [
      {
        label: "High",
        risk: "High",
        checked: true,
        color: "red",
        id: "highSwitch",
      },
      {
        label: "Medium",
        risk: "Medium",
        checked: true,
        color: "orange",
        id: "mediumSwitch",
      },
      {
        label: "Low",
        risk: "Low",
        checked: true,
        color: "yellow",
        id: "lowSwitch",
      },
      {
        label: "Informational",
        risk: "Informational",
        checked: true,
        color: "blue",
        id: "infoSwitch",
      },
    ],
  };

  async componentDidMount() {
    try {
      const response = await Axios.get(
        `${
          process.env.REACT_APP_API_ENDPOINT || config.REACT_APP_API_ENDPOINT
        }/api/reports/${this.props.match.params.id}`,
        {
          header: {
            "Content-Type": "multipart/form-data",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
          },
        }
      );
      const entries = response.data;
      this.setState({ scanResults: entries });
    } catch (err) {
      console.error(err);
    }
  }

  filterAlerts = (alerts) => {
    return alerts.filter((al) => {
      return this.state.showAlerts.find((el) => el.risk === al.risk).checked;
    });
  };

  handleChange = (input) => (e) => {
    // console.log(input);

    const showAlerts = [...this.state.showAlerts];
    const showAlert = showAlerts.find((el) => el.id === e.target.id);
    showAlert.checked = e.target.checked;

    this.setState({ showAlerts });
  };

  render() {
    return (
      <div>
        <h3 style={{ marginTop: "1em", marginBottom: "1em" }}>
          Results for report: {this.props.match.params.id}
        </h3>
        <FilterAlerts
          showAlerts={this.state.showAlerts}
          onChange={this.handleChange}
        />
        <ListViolationCard
          report_id={this.props.match.params.id}
          data={this.filterAlerts(this.state.scanResults)}
        />
      </div>
    );
  }
}

export default Report;
