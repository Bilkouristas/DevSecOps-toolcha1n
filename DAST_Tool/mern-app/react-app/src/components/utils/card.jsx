import React from "react";
import { Link } from "react-router-dom";
import wascTable from "../../wascidTable";

function Card(props) {
  const spanMessage = {
    label: wascTable[props.wascid],
    inits: wascTable[props.wascid].match(/\b(\w)/g).join(""),
  };

  const warningColor = {
    "False Positive": "purple",
    Informational: "blue",
    Low: "yellow",
    Medium: "orange",
    High: "red",
  };

  const cardDescription = (desc, maxChars) => {
    let short_desc = "";
    let idx = 0;

    if (desc.length > maxChars) {
      const words = desc.split(" ");

      while (short_desc.length < maxChars) {
        short_desc += words[idx] + " ";
        idx += 1;
      }

      return short_desc + "...";
    }
    return desc;
  };

  return (
    <div
      className="card mb-4 box-shadow"
      style={{ width: "28rem", height: "28rem" }}
    >
      <div className="card-header">
        <h4 className="my-0 font-weight-normal">{props.name}</h4>
      </div>
      <div className="card-body d-flex flex-column">
        <div className="row">
          <p
            className="card-text"
            align="justify"
            style={{ marginLeft: "1em", marginRight: "1em" }}
          >
            {cardDescription(props.description, props.maxCharsInDescr)}
          </p>
        </div>

        <div className="row" style={{ marginTop: "2em" }}>
          <div className="col">
            <Link
              to={`/reports/${props.report_id}/${props.name
                .split(" ")
                .join("")}/${props.risk}`}
            >
              Alerts Number: {props.alertsNum}
            </Link>
          </div>
        </div>

        <div className="row mt-auto">
          <div className="col" style={{ fontSize: "20px" }}>
            <i
              className="fa fa-exclamation-triangle"
              style={{ color: warningColor[props.risk] }}
            />
            &nbsp;
            {props.risk}
          </div>

          <div className="col">
            <span className="lead">
              <span
                style={{ marginBottom: "1em" }}
                className="badge badge-pill badge-primary"
              >
                {spanMessage["label"]} &nbsp;
                <span className="badge badge-light" align="left">
                  {spanMessage["inits"]}
                </span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
