// Package Imports
const async = require("async");
const { spawn } = require("child_process");
const http = require("http");
const https = require("https");
const _progress = require("cli-progress");
const { promisify } = require("util");
const ZapClient = require("zaproxy");

// Custom Imports
const convertSelTest = require("./seleniumUtils");

// ZAP process
let zapProc;

/**
 * Check if supplied address is reachable.
 * @param {String} url Target URL to scan.
 */
const checkURL = (url) => {
  // Timeout if the website does not
  // respond for more than 10 seconds.
  const url_timeout = 10000;
  return new Promise((resolve, reject) => {
    console.log(`Checking if '${url}' is reachable...`);
    if (url.startsWith("http://")) {
      const httpReq = http
        .get(url, { timeout: url_timeout }, () => resolve())
        .on("error", (err) => {
          reject(`The Target URL Address is unreachable. ${err.message}`);
        })
        .on("timeout", () => httpReq.abort());
    } else if (url.startsWith("https://")) {
      const httpsReq = https
        .get(url, { timeout: url_timeout }, () => resolve())
        .on("error", (err) => {
          reject(`The Target URL Address is unreachable. ${err.message}`);
        })
        .on("timeout", () => httpsReq.abort());
    } else {
      reject("The Target URL Address is not in the 'http(s)://' format.");
    }
  });
};

/**
 * Start the ZAP application.
 * @param {ZapClient} zaproxy Instance to interact with the ZAP API.
 * @param {Object} zapProcOpt ZAP process options.
 * @param {Boolean} zapProcOpt.runAsDaemon If true, run ZAP as daemon process.
 * @param {String} zapProcOpt.zapPath Path to ZAP executable (zap.sh for linux, zap.bat for windows).
 */
const startZAP = (zaproxy, zapProcOpt) => {
  return new Promise((resolve, reject) => {
    // Start ZAP process.
    console.log("Starting ZAP...");
    zapProc = spawn(
      `${zapProcOpt.zapPath}`,
      [
        `${zapProcOpt.runAsDaemon ? "-daemon" : ""}`,
        `-config api.disablekey=true`,
        `-newsession ${new Date().getTime()}`,
      ],
      { shell: true, detached: true }
    );

    // Check if app has started by calling version check.
    // Using async retry loop to keep checking status until up.
    async.retry(
      { times: 15, interval: 3000 },
      (callback) => {
        zaproxy.core.version((err, res) =>
          err ? callback(err, null) : callback(null, res)
        );
      },
      (err) =>
        err
          ? reject("Unable to determine if ZAP child process is up.")
          : resolve()
    );
  });
};

/**
 * Create a new context.
 * @param {ZapClient} zaproxy Instance to interact with the ZAP API.
 */
const createNewContext = (zaproxy) => {
  return new Promise((resolve, reject) => {
    console.log("Creating a new context...");
    zaproxy.context.newContext("Default Context", (err) =>
      err ? reject(`Creating a new context Failed. ${err.message}`) : resolve()
    );
  });
};

/**
 *
 * Convert Selenium IDE Test (Exported as JavaScript Mocha file)
 * to a temporary js file, run it and delete it.
 * @param {Object} zapOpt ZAP internal options.
 * @param {Object} seleniumTest Selenium Test Parameters.
 * @param {String} seleniumTest.browser: Choose prefered browser ('firefox' or 'chrome').
 * @param {Boolean} seleniumTest.headless: Don't show browser while running the selenium test.
 * @param {String} seleniumTest.testPath: Set path the provided selenium test.
 * @param {String} selenHub: Selenium Hub URL to control browsers.
 */
const runSeleniumTest = async (zapOpt, seleniumTest, selenHub) => {
  console.log(
    "Exploring the website using a web browser proxied through ZAP at this time."
  );
  try {
    // Convert given Selenium Test to the appropriate form and run it.
    await convertSelTest(
      seleniumTest,
      zapOpt.proxy.replace(/(^\w+:|^)\/\//, ""),
      selenHub
    );
  } catch (err) {
    console.error(`Selenium Test failed. ${err.message}`);
  }
  console.log("Browsing completed.\n");
};

// /**
//  * Create Selenium HTTP Session to use Selenium's user credentials.
//  * @param {ZapClient} zaproxy Instance to interact with the ZAP API.
//  * @param {String} url Target URL to scan.
//  */
// const createHTTPSessionAsActive = (zaproxy, url) => {
//   return new Promise((resolve, reject) => {
//     console.log("Creating a new HTTP Session...");
//     zaproxy.httpSessions.createEmptySession(url, "Session 0", (err) =>
//       err
//         ? reject(`Creating a new HTTP Session Failed. ${err.message}`)
//         : resolve()
//     );
//   });
// };

/**
 * Set Selenium HTTP Session as active to use Selenium's user credentials.
 * @param {ZapClient} zaproxy Instance to interact with the ZAP API.
 * @param {String} url Target URL to scan.
 */
const setHTTPSessionAsActive = (zaproxy, url) => {
  return new Promise((resolve, reject) => {
    console.log("Setting the new HTTP Session as active...");
    zaproxy.httpSessions.setActiveSession(url, "Session 0", (err) =>
      err
        ? reject(
            `Setting the new HTTP Session as active Failed. ${err.message}`
          )
        : resolve()
    );
  });
};

/**
 * Set the scanning context.
 * @param {ZapClient} zaproxy Instance to interact with the ZAP API.
 * @param {String} regexAddress URL or Regular Expression of the URL to include.
 */
const setContext = (zaproxy, regexAddress) => {
  return new Promise((resolve, reject) => {
    regexAddress = regexAddress.concat(".*");
    console.log(`Including '${regexAddress}' in context...`);
    zaproxy.context.includeInContext("Default Context", regexAddress, (err) =>
      err
        ? reject(
            `Context Inclusion Failed for '${regexAddress}. ${err.message}`
          )
        : resolve()
    );
  });
};

/**
 * Exclude the given URL - Regular Expression from the context.
 * @param {ZapClient} zaproxy Instance to interact with the ZAP API.
 * @param {String} regexAddress URL or Regular Expression of the URL to exclude.
 */
const exclContext = (zaproxy, regexAddress) => {
  return new Promise((resolve, reject) => {
    regexAddress = regexAddress.concat(".*");
    console.log(`Excluding '${regexAddress}' from context...`);
    zaproxy.context.excludeFromContext("Default Context", regexAddress, (err) =>
      err
        ? reject(
            `Context Exclusion Failed for '${regexAddress}. ${err.message}`
          )
        : resolve()
    );
  });
};

/**
 * Exclude the given URL - Regular Expression from spider scans.
 * @param {ZapClient} zaproxy Instance to interact with the ZAP API.
 * @param {String} regexAddress URL or Regular Expression of the URL to exclude.
 */
const exclFromSpider = (zaproxy, regexAddress) => {
  return new Promise((resolve, reject) => {
    regexAddress = regexAddress.concat(".*");
    console.log(`Excluding '${regexAddress}' from spider...`);
    zaproxy.spider.excludeFromScan(regexAddress, (err) =>
      err
        ? reject(`Spider Exclusion Failed for '${regexAddress}. ${err.message}`)
        : resolve()
    );
  });
};

/**
 * Exclude the given URL - Regular Expression from the active scan.
 * @param {ZapClient} zaproxy Instance to interact with the ZAP API.
 * @param {String} regexAddress URL or Regular Expression of the URL to exclude.
 */
const exclFromAscan = (zaproxy, regexAddress) => {
  return new Promise((resolve, reject) => {
    regexAddress = regexAddress.concat(".*");
    console.log(`Excluding '${regexAddress}' from active scan...`);
    zaproxy.ascan.excludeFromScan(regexAddress, (err) =>
      err
        ? reject(
            `Active scan Exclusion Failed for '${regexAddress}. ${err.message}`
          )
        : resolve()
    );
  });
};

/**
 * Set the scanning scope.
 * @param {ZapClient} zaproxy Instance to interact with the ZAP API.
 */
const setScope = (zaproxy) => {
  return new Promise((resolve, reject) => {
    console.log("Setting scope...");
    zaproxy.context.setContextInScope("Default Context", true, (err) =>
      err ? reject(`Scope Set Failed. ${err.message}`) : resolve()
    );
  });
};

/**
 * Start spider.
 * @param {ZapClient} zaproxy Instance to interact with the ZAP API.
 * @param {String} url Target URL to scan.
 */
const startSpider = (zaproxy, url, spiderOpt) => {
  return new Promise((resolve, reject) => {
    console.log("Starting spider...");
    console.log(spiderOpt);
    zaproxy.spider.scan(
      url,
      spiderOpt.maxchildren,
      spiderOpt.recurse,
      "Default Context",
      spiderOpt.subtreeonly,
      (err) => (err ? reject(`Spider Start Failed. ${err.message}`) : resolve())
    );
  });
};

/**
 * Check for spider status. Loop until complete.
 * @param {ZapClient} zaproxy Instance to interact with the ZAP API.
 */
const checkSpider = (zaproxy) => {
  return new Promise((resolve, reject) => {
    console.log("Waiting for spider to complete...");
    let status = "0";

    // Using async.until loop to keep checking status until complete.
    async.until(
      async () => {
        return status == "100";
      },
      (callback) => {
        zaproxy.spider.status(0, (_, res) => {
          status = res.status;
          callback();
        });
      },
      (err) => (err ? reject(`Spider Scan Error. ${err.message}`) : resolve())
    );
  });
};

/**
 * Check for passive scan status. Loop until complete.
 * @param {ZapClient} zaproxy Instance to interact with the ZAP API.
 */
const checkPassiveScan = (zaproxy) => {
  return new Promise((resolve, reject) => {
    console.log("Waiting for passive scan to complete...");
    let leftToScan = "";

    // Using async.until loop to keep checking until complete.
    async.until(
      async () => {
        return leftToScan == "0";
      },
      (callback) => {
        zaproxy.pscan.recordsToScan((_, res) => {
          leftToScan = res.recordsToScan;
          callback();
        });
      },
      (err) => (err ? reject(`Passive Scan Error. ${err.message}`) : resolve())
    );
  });
};

/**
 * Start AJAX spider.
 * @param {ZapClient} zaproxy Instance to interact with the ZAP API.
 * @param {String} url Target URL to scan.
 */
const startAJAXSpider = (zaproxy, url, ajaxOpt) => {
  return new Promise((resolve, reject) => {
    console.log("Starting AJAX spider...");
    zaproxy.ajaxSpider.scan(
      url,
      true,
      "Default Context",
      ajaxOpt.subtreeonly,
      (err) =>
        err ? reject(`AJAX Spider Start Failed. ${err.message}`) : resolve()
    );
  });
};

/**
 * Check for AJAX spider status. Loop until complete.
 * @param {ZapClient} zaproxy Instance to interact with the ZAP API.
 * @params {Number} ajaxTimeout Max duration (in seconds) of the AJAX scan.
 */
const checkAJAXSpider = (zaproxy, ajaxTimeout) => {
  return new Promise((resolve, reject) => {
    console.log("Waiting for AJAX spider to complete...");
    let status = "running";

    const startTime = new Date();

    // Using async.until loop to keep checking status until complete.
    async.until(
      async () => {
        // Stop scan if it exceeds 1 minute.
        return (
          status != "running" ||
          new Date() - startTime > ajaxTimeout * 60 * 1000
        );
      },
      (callback) => {
        zaproxy.ajaxSpider.status((_, res) => {
          status = res.status;
          callback();
        });
      },
      (err) =>
        err ? reject(`AJAX Spider Scan Error. ${err.message}`) : resolve()
    );
  });
};

/**
 * Start active scanner.
 * @param {ZapClient} zaproxy Instance to interact with the ZAP API.
 * @param {String} url Target URL to scan.
 */
const startActiveScan = (zaproxy, ascanOpt) => {
  return new Promise((resolve, reject) => {
    console.log("Starting active scanner...");
    zaproxy.ascan.scan(
      null,
      ascanOpt.recurse,
      true,
      "Default Policy",
      null,
      null,
      1,
      (err) =>
        err ? reject(`Active Scan Start Failed. ${err.message}`) : resolve()
    );
  });
};

/**
 * Check for active scanning status. Loop until complete.
 * @param {ZapClient} zaproxy Instance to interact with the ZAP API.
 */
const checkActiveScan = (zaproxy) => {
  return new Promise((resolve, reject) => {
    console.log("Waiting for active scanner to complete...");
    let status = "0";
    // Use a progress bar
    let bar = new _progress.Bar({
      format: "Scan progress [{bar}] {percentage}%",
    });
    bar.start(100, 0);

    // Using async.until loop to keep checking status until complete.
    async.until(
      async () => {
        return status == "100";
      },
      (callback) => {
        zaproxy.ascan.status(0, (_, res) => {
          status = res.status;
          // Update with the given status
          // after parsing it from string to int.
          bar.update(parseInt(status));
          callback();
        });
      },
      (err) => {
        if (err) {
          reject(`Active Scan Check Failed. ${err.message}`);
        } else {
          // Stop pogress bar.
          bar.stop();
          resolve();
        }
      }
    );
  });
};

/**
 * Get ZAP Report as a JavaScript Object.
 * @param {ZapClient} zaproxy Instance to interact with the ZAP API.
 */
const getReport = (zaproxy, url) => {
  // Promisify zaproxy functions to return a promise
  // instead of using a callback.
  const promisifiedSpiderReport = promisify(zaproxy.spider.results).bind(
    zaproxy.spider
  );
  const promisifiedAjaxReport = promisify(zaproxy.ajaxSpider.results).bind(
    zaproxy.ajaxSpider
  );
  const promisifiedScanReport = promisify(zaproxy.core.alerts).bind(
    zaproxy.core
  );
  console.log("Generating report.");

  // Join all promises to a single promise.
  return Promise.allSettled([
    promisifiedSpiderReport(null),
    promisifiedAjaxReport(null, null),
    promisifiedScanReport(url, null, null, null),
  ])
    .then(([resSpider, resAjax, resScan]) => {
      return {
        spiderResults: "value" in resSpider ? resSpider.value.results : [],
        ajaxSpiderResults: resAjax ? resAjax.value.results : [],
        scanResults: resScan ? resScan.value.alerts : [],
      };
    })
    .catch((err) => {
      Promise.reject(err);
    });
};

/**
 * Print error if there is any and then kill ZAP process.
 * @param {Error} err An error caused by a promise rejection or other reasons.
 */
const terminateZAP = (err) => {
  if (err) console.error(err);
  if (zapProc) process.kill(-zapProc.pid);
};

module.exports = {
  checkURL,
  startZAP,
  createNewContext,
  // createHTTPSessionAsActive,
  runSeleniumTest,
  setHTTPSessionAsActive,
  setContext,
  exclContext,
  exclFromSpider,
  exclFromAscan,
  startSpider,
  checkSpider,
  setScope,
  checkPassiveScan,
  startAJAXSpider,
  checkAJAXSpider,
  startActiveScan,
  checkActiveScan,
  getReport,
  terminateZAP,
};
