const express = require("express");
const {
  Report,
  validateReport,
  validateManualReport,
} = require("../models/report");
const zapscanner = require("../zapscanner/index");
const multer = require("multer");
const fs = require("fs");
const groupEntries = require("../utils/groupEntries");
const config = require("config");

const router = express.Router();

// Define storage-upload instance
const storage = multer.diskStorage({
  destination: (request, file, cb) => {
    cb(null, "public");
  },
  filename: (request, file, cb) => {
    cb(null, "seleniumtestfile.js");
  },
});
const upload = multer({ storage }).single("file");

// Responds with an array of all the report-entries.
router.get("/", async (req, res) => {
  let reports = await Report.find({}).select({ __v: 0 });
  reports.map((report) => {
    report["spiderResults"] = Boolean(
      report["spiderResults"] && report["spiderResults"].length
    );
    report["ajaxSpiderResults"] = Boolean(
      report["ajaxSpiderResults"] && report["ajaxSpiderResults"].length
    );
    report["scanResults"] = Boolean(
      report["scanResults"] && report["scanResults"].length
    );
  });

  res.setHeader("Content-Type", "application/json");
  res.send(reports);
});

// Full report of the entry with the given id.
router.get("/:id", async (req, res) => {
  const report = await Report.findById(req.params.id).select({
    scanResults: 1,
  });

  if (!report)
    return res.status(404).send("The report with the given ID was not found.");

  const entries = groupEntries(report["scanResults"]);
  entries.forEach((el) => {
    el["alertsNum"] = el.details.length;
    delete el.details;
  });

  res.setHeader("Content-Type", "application/json");

  res.send(entries);
});

// Alerts of the given report category.
router.get("/:id/:name/:risk", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).select({
      scanResults: 1,
    });

    if (!report)
      return res
        .status(404)
        .send("The report with the given ID was not found.");

    let alert = report["scanResults"].filter(
      (al) =>
        al.name.split(" ").join("") === req.params.name &&
        al.risk === req.params.risk
    );
    // console.log(groupEntries(alert)[1]);
    res.setHeader("Content-Type", "application/json");

    res.send(groupEntries(alert)[0]);
  } catch (err) {
    res.status(500).send("An unexpected error occured.");
  }
});

// Upload route to receive a selenium mocha js test file if provided.
router.post("/upload", async (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }

    return res.send("File Upload OK");
  });
});

// Route to receive manually created zap reports produced by ZAP as strings.
router.post("/sendreport", async (req, res) => {
  const { error } = validateManualReport(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let {
    url,
    zapScans,
    spiderResults,
    ajaxSpiderResults,
    scanResults,
  } = req.body;

  try {
    spiderResults = spiderResults ? JSON.parse(spiderResults) : {};
    spiderResults = "results" in spiderResults ? spiderResults["results"] : [];

    ajaxSpiderResults = ajaxSpiderResults ? JSON.parse(ajaxSpiderResults) : {};
    ajaxSpiderResults =
      "results" in ajaxSpiderResults ? ajaxSpiderResults["results"] : [];

    scanResults = scanResults ? JSON.parse(scanResults) : {};
    scanResults = "alerts" in scanResults ? scanResults["alerts"] : [];

    const newReport = await new Report({
      url,
      zapScans,
      spiderResults,
      ajaxSpiderResults,
      scanResults,
      seleniumInfo: { usage: false, browser: null },
      spiderOpt: null,
      ajaxOpt: null,
      ascanOpt: null,
    }).save();

    res.send(newReport._id);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// Route to start a ZAP scan using a UI form.
router.post("/startscan", async (req, res) => {
  const { error } = validateReport(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let {
    url,
    includeURLs,
    excludeURLs,
    zapScans,
    seleniumTest,
    spiderOpt,
    ajaxOpt,
    ascanOpt,
  } = req.body;

  console.log(req.body);

  const zapProcOpt = {
    runAsDaemon: false,
    zapPath: config.get("ZAP_PATH"),
  };

  const zapOpt = {
    proxy: config.get("ZAP_PROXY"),
  };

  const isDocker = config.get("IS_DOCKER") === "true" ? true : false;

  try {
    seleniumTest.testPath
      ? (seleniumTest.testPath = "./public/seleniumtestfile.js")
      : (seleniumTest = null);

    const selenHub =
      isDocker && seleniumTest ? "http://selenium-hub:4444/wd/hub" : null;

    const report = await zapscanner(
      url,
      zapProcOpt,
      zapOpt,
      includeURLs,
      excludeURLs,
      zapScans,
      isDocker,
      selenHub,
      seleniumTest,
      spiderOpt,
      ajaxOpt,
      ascanOpt
    );

    const { spiderResults, ajaxSpiderResults, scanResults } = report;
    const seleniumInfo = {
      usage: seleniumTest ? true : false,
      browser: seleniumTest ? seleniumTest.browser : null,
    };

    const newReport = await new Report({
      url,
      zapScans,
      spiderResults,
      ajaxSpiderResults,
      scanResults,
      seleniumInfo,
      spiderOpt,
      ajaxOpt,
      ascanOpt,
    }).save();

    if (seleniumTest)
      fs.unlink(seleniumTest.testPath, (err) => {
        if (err) console.error(err);
      });

    res.send(newReport._id);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

module.exports = router;
