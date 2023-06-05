import React from "react";
import Card from "./card";

function RowViolationCard(props) {
  return (
    <div className="container col-11">
      <div className="row" align="center" style={{ marginTop: "2em" }}>
        {props.groupOfEntries.map((entry) => (
          <div className="col" key={props.groupOfEntries.indexOf(entry)}>
            <Card
              maxCharsInDescr={props.maxCharsInDescr}
              report_id={props.report_id}
              name={entry.name}
              description={entry.description}
              wascid={entry.wascid}
              risk={entry.risk}
              alertsNum={entry.alertsNum}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default RowViolationCard;
