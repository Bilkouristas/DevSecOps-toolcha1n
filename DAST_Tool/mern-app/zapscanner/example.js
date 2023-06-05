const zapscanner = require("./index");

/* Setting Parameters */

// URL to perform tests to.
const url = "http://localhost:8080/WebGoat";

// ZAP Process Options.
const zapProcOpt = {
  runAsDaemon: false,
  zapPath: "../../ZAP_2.9.0/zap.sh",
};

// ZAP Options.
const zapOpt = {
  proxy: "http://localhost:8081",
};

// Scans to perform.
const zapScans = {
  spider: false,
  ajaxspider: true,
  activescan: false,
};

// Optional settings
const spiderOpt = { maxchildren: null, recurse: true, subtreeonly: false };
const ajaxOpt = { subtreeonly: false, ajaxTimeout: 1 };
const ascanOpt = { recurse: true };

// URLs to include in scanning.
const includeURLs = [];

// URLs to exclude from scanning.
// Ex. Don't logout, register a new account or change password while scanning.
const excludeURLs = [
  `${url}/logout.php`,
  `${url}/vulnerabilities/csrf`,
  `${url}/vulnerabilities/captcha`,
];

// Selenium Test Settings
const seleniumTest = {
  browser: "firefox",
  headless: false,
  testPath: "./exampleSeleniumTestDVWA.js",
};

/* Running the package */

// zapscanner(
//   url,
//   zapProcOpt,
//   zapOpt,
//   includeURLs,
//   excludeURLs,
//   zapScans,
//   spiderOpt,
//   ajaxOpt,
//   ascanOpt
// ).then((res) => console.log(JSON.stringify(res, null, 4)));

zapscanner(
  url,
  zapProcOpt,
  zapOpt,
  includeURLs,
  excludeURLs,
  zapScans,
  seleniumTest,
  spiderOpt,
  ajaxOpt,
  ascanOpt
).then((res) => console.log(JSON.stringify(res, null, 4)));
