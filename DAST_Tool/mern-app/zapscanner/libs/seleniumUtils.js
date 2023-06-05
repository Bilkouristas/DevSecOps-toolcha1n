"use strict";
const fs = require("fs");

/* Regex to locate main function of the Selenium IDE test.
 * This regex finds three patterns at the same time:
 *
 * it('<anything>', async function () { <anything>
 *
 * OR
 *
 * })\n  OR  })\r\n
 */
const regexMainFun = /it\((["'])[^]*?\1,\s*async\s*function\s*\(\)\s*\{|\}\)\r\n|\}\)\n/g;

/**
 * Wrap the main function of the Selenium test around a
 * template js code with all the necessary settings.
 * @param {String} data Stringified code of the main function of the Selenium test.
 */
const templateWrap = (data) => {
  return `
  const { Builder, By, Key, until, Capabilities, Capability } = require('selenium-webdriver')
  const SeleniumServer = require("selenium-webdriver/remote").SeleniumServer;
  const firefox = require('selenium-webdriver/firefox');
  const chrome = require('selenium-webdriver/chrome');
  const proxy = require('selenium-webdriver/proxy');
  const assert = require('assert');
  
  async (seleniumTest, proxyAddress, selenHub) => {
    try{
      let driver;
      if(seleniumTest.browser == 'firefox'){
        if(selenHub){
          driver = await new Builder()
          .forBrowser('firefox')
          .usingServer(selenHub)
          .setFirefoxOptions(new firefox.Options().addArguments("-headless"))
          .withCapabilities(Capabilities.firefox().set('acceptInsecureCerts', true))
          .setProxy(proxy.manual({ http: proxyAddress, https: proxyAddress }))
          .build();
        }else{
          driver = await new Builder()
              .forBrowser('firefox')
              .setFirefoxOptions(new firefox.Options().addArguments(seleniumTest.headless ? "-headless" : ""))
              .withCapabilities(Capabilities.firefox().set('acceptInsecureCerts', true))
              .setProxy(proxy.manual({ http: proxyAddress, https: proxyAddress }))
              .build();
            }
      }else if(seleniumTest.browser == 'chrome'){
        if(selenHub){
          driver = await new Builder()
          .forBrowser('chrome')
          .usingServer(selenHub)
          .setChromeOptions(new chrome.Options().addArguments('--headless'))
          .withCapabilities(Capabilities.chrome().set(Capability.ACCEPT_INSECURE_TLS_CERTS, true))
          .setProxy(proxy.manual({ http: proxyAddress, https: proxyAddress }))
          .build();
          }else{
          driver = await new Builder()
              .forBrowser('chrome')
              .setChromeOptions(new chrome.Options().addArguments(seleniumTest.headless ? '--headless' : '--ignore-certificate-errors'))
              .withCapabilities(Capabilities.chrome().set(Capability.ACCEPT_INSECURE_TLS_CERTS, true))
              .setProxy(proxy.manual({ http: proxyAddress, https: proxyAddress }))
              .build();
            }
      }else{
          throw new Error("Only 'firefox' or 'chrome' browsers are supported.");
      }

      /* Test starts here */
        ${data}
      /* Test ends here */
  
      driver.quit();
    }catch(err){
      return Promise.reject(new Error(err));
    }
  }`;
};

/**
 * Convert the default js Selenium test to the appropiate form and run it.
 * @param {Object} seleniumTest Selenium Test Parameters.
 * @param {String} seleniumTest.browser: Choose prefered browser ('firefox' or 'chrome').
 * @param {Boolean} seleniumTest.headless: Don't show browser while running the selenium test.
 * @param {String} seleniumTest.testPath: Set path the provided selenium test.
 * @param {String} proxyAddress Configure ZAP to proxy the browser.
 */
module.exports = (seleniumTest, proxyAddress, selenHub) => {
  // Read the main function of the selenium test
  // as a string. Wrap it arround a template code.
  // Evaluate it and save it as a function variable.
  const runSelen = eval(
    templateWrap(
      fs
        .readFileSync(seleniumTest.testPath, "utf8")
        .split(regexMainFun)
        .splice(-5)[0]
    )
  );

  // Call the function and return its output
  // which is a promise.
  return runSelen(seleniumTest, proxyAddress, selenHub);
};
