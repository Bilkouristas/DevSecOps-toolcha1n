const _ = require("lodash");

module.exports = function (alerts) {
  // Add a composite key in every object
  alerts.forEach((alert) => {
    alert["comp_key"] = JSON.stringify({
      name: alert["name"],
      description: alert["description"],
      solution: alert["solution"],
      wascid: alert["wascid"],
      risk: alert["risk"],
    });
  });

  // Group by the composite key
  let grouped = _.mapValues(_.groupBy(alerts, "comp_key"), (alerts_lst) =>
    alerts_lst.map((alert) =>
      _.omit(alert, [
        "comp_key",
        "name",
        "description",
        "solution",
        "wascid",
        "risk",
      ])
    )
  );

  // Return an array of grouped objects in the appropriate form
  return Object.entries(grouped).map(([key, value]) => {
    let { name, description, solution, wascid, risk } = JSON.parse(key);
    return { name, description, solution, wascid, risk, details: value };
  });
};
