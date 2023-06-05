const error = require("../middleware/error");
const express = require("express");
const cors = require("cors");

module.exports = function (app) {
  // middleware functions
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb" }));
  app.use("/", require("../routes/home"));
  app.use("/api/reports/", require("../routes/reports"));

  app.use(express.static("static"));

  app.use(error);
};
