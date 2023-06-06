// Package Imports
const ZapClient = require("zaproxy");

// Custom Imports
const {
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
} = require("./libs/zapUtils");

/**
 *
 * Use OWASP ZAP to scan a given URL and produce analytical reports.
 * Optionaly provide a JavaScript Mocha selenium test for an authenticated
 * scanning session.
 *
 * @param {String} url Target URL to scan.
 * @param {Object} zapProcOpt ZAP process options.
 * @param {Boolean} zapProcOpt.runAsDaemon If true, run ZAP as daemon process.
 * @param {String} zapProcOpt.zapPath Path to ZAP executable (zap.sh for linux, zap.bat for windows).
 * @param {Object} zapOpt ZAP internal options.
 * @param {String[]} excludeURLs Endpoints to exclude from scanning.
 * @param {Object} zapScans Scans to perform.
 * @param {Boolean} zapScans.spider If true, perform Spider Scan to crawl the URL.
 * @param {Boolean} zapScans.ajaxspider If true, perform AJAX Spider Scan to the URL.
 * @param {Boolean} zapScans.activescan If true, perform Active Scan to the URL.
 * @param {Boolean} isDocker True if ZAP is running from a docker container.
 * @param {String} selenHub Selenium Hub URL to control browsers.
 * @param {Object} seleniumTest Selenium Test Parameters.
 * @param {String} seleniumTest.browser Choose prefered browser ('firefox' or 'chrome').
 * @param {Boolean} seleniumTest.headless Don't show browser while running the selenium test.
 * @param {String} seleniumTest.testPath Set path to the provided selenium test.
 * @param {Object} spiderOpt Spider Scan options
 * @param {Number} spiderOpt.maxchildren Limit the number of children scanned.
 * @param {Boolean} spiderOpt.recurse Prevent the spider from seeding recursively.
 * @param {Boolean} spiderOpt.subtreeonly Allows to restrict the spider scan under a site's subtree.
 * @param {Object} ajaxOpt AJAX Spider Scan options
 * @param {Boolean} ajaxOpt.subtreeonly Allows to restrict the ajax spider scan under a site's subtree.
 * @param {Number} ajaxOpt.ajaxTimeout Max duration (in seconds) of the AJAX scan.
 * @param {Object} ascanOpt Active Scan options
 * @param {Boolean} ascanOpt.recurse Perform active scan on URLs under the given URL.
 * @returns {Promise<String>} Promise to return an object with the scanning reports.
 */
module.exports = async (
  url,
  zapProcOpt,
  zapOpt,
  includeURLs,
  excludeURLs,
  zapScans,
  isDocker = false,
  selenHub = null,
  seleniumTest = null,
  spiderOpt = { maxchildren: null, recurse: true, subtreeonly: false },
  ajaxOpt = { subtreeonly: false, ajaxTimeout: 1 },
  ascanOpt = { recurse: true }
) => {
  // Create ZAP instance.
  const zaproxy = new ZapClient(zapOpt);

  try {
    // Check if URL is reachable
    // by sending a GET request to it.
    await checkURL(url);

    // Start zaproxy process.
    if (!isDocker) await startZAP(zaproxy, zapProcOpt);
    // If ZAP is not a daemon wait for 2 more seconds.
    if (!zapProcOpt.runAsDaemon)
      await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create a new Context if it does not exist.
    try {
      await createNewContext(zaproxy);
    } catch {
      console.log("Default Context already exists.");
    }

    // Create a new HTTP Session
    // await createHTTPSessionAsActive(zaproxy, url);

    // Run the selenium test if provided.
    // Use Selenium session's credentials.
    // ('Session 0' of the target url)
    if (seleniumTest) {
      await runSeleniumTest(zapOpt, seleniumTest, selenHub);
      try {
        await setHTTPSessionAsActive(zaproxy, url);
      } catch (e) {
        console.log(`Skipping step. ${e}`);
      }
    }

    // Set the context to scan the chosen endpoints
    // (if none: all) for the given URL.
    if (includeURLs.length === 0) await setContext(zaproxy, url);
    for (let el of includeURLs) {
      await setContext(zaproxy, el);
    }

    // Exclude provided endpoints.
    for (let el of excludeURLs) {
      await exclContext(zaproxy, el);
      await exclFromSpider(zaproxy, el);
      await exclFromAscan(zaproxy, el);
    }

    // Run Spider Scan to crawl the given URL.
    // Check Spider status until its done.
    if (zapScans["spider"]) {
      if (includeURLs.length > 0) {
        await startSpider(zaproxy, null, spiderOpt);
      } else {
        await startSpider(zaproxy, url, spiderOpt);
      }
      await checkSpider(zaproxy);
    }

    // Set the Scope to Default.
    await setScope(zaproxy);

    // Wait for Passive Scan until its done.
    await checkPassiveScan(zaproxy);

    // Run AJAX Spider Scan to the given URL.
    // Check AJAX Spider status until its done.
    if (zapScans["ajaxspider"]) {
      await startAJAXSpider(zaproxy, url, ajaxOpt);
      await checkAJAXSpider(zaproxy, ajaxOpt.ajaxTimeout);
    }

    // Run Active Scan to crawl the given URL.
    // Check Active Scan status until its done
    if (zapScans["activescan"]) {
      await startActiveScan(zaproxy, url, ascanOpt);
      await checkActiveScan(zaproxy);
    }

    // Schedule ZAP termination after 1 second
    // to give time to the function to return.
    setTimeout(() => {
      console.log("Done!");
      terminateZAP();
    }, 1000);

    // Return ZAP report as a Promise.
    return getReport(zaproxy, url);
  } catch (err) {
    // If an error is caught ZAP is terminated.
    terminateZAP(err);
    return Promise.reject(new Error(err));
  }
};
