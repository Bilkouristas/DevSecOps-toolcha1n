import React from "react";
import RowViolationCard from "./rowViolationCard";

function groupObjectsForRow(flatArray, itemsPerRow) {
  let newArray = [];
  while (flatArray.length > 0) newArray.push(flatArray.splice(0, itemsPerRow));
  return newArray;
}

function ListViolationCard(props) {
  const entriesPerRow = groupObjectsForRow(props.data, 3);

  return (
    <React.Fragment>
      {entriesPerRow.map((entry) => (
        <RowViolationCard
          key={entriesPerRow.indexOf(entry)}
          report_id={props.report_id}
          groupOfEntries={entry}
          maxCharsInDescr={500}
        />
      ))}
    </React.Fragment>
  );
}

export default ListViolationCard;
