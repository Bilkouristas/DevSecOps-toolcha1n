# Zapscanner

## Description

This is a ZAP package used to handle OWASP ZAP application in conjuction with Selenium for authenticated scanning.

## Test the package - Preparation

1. Install Docker.
2. Run the docker container of the DVWA vulnerable application found in [here](https://hub.docker.com/r/vulnerables/web-dvwa) by running:

```
docker run --rm -it -p 8070:80 vulnerables/web-dvwa
```

4. Use Firefox or Chrome along with the Selenium IDE addon to "record" the login process and export the test session as a JavaScript Mocha file.

5. Make sure you have JAVA (JDK) installed and OWASP ZAP (use the script provided to download ZAP).

## Zapscanner

### Quick Start

1. Modify the default settings of the `example.js` file. See the Options section for more details.

2. Open a terminal and run:

```
node example.js
```

### Options

The options provided are listed in the table below.

| Type     | Parameter                | Description                                                          |
| -------- | ------------------------ | -------------------------------------------------------------------- |
| String   | `url`                    | Target URL to scan.                                                  |
| Boolean  | `isDocker`               | True if ZAP is running from a docker container.                      |
| String   | `selenHub`               | Selenium Hub URL to control browsers if `isDocker` is true           |
| Object   | `zapProcOpt`             | ZAP process options.                                                 |
| Boolean  | `zapProcOpt`.runAsDaemon | If true, run ZAP as daemon process.                                  |
| String   | `zapProcOpt`.zapPath     | Path to ZAP executable (`zap.sh` for linux, `zap.bat` for windows).  |
| Object   | `zapOpt`                 | ZAP internal options.                                                |
| String[] | `includeURLs`            | <i>Optional</i>: Endpoints to include in scanning. (Default: All)    |
| String[] | `excludeURLs`            | <i>Optional</i>: Endpoints to exclude from scanning. (Default: None) |
| Object   | `zapScans`               | Scans to perform.                                                    |
| Boolean  | `zapScans`.spider        | If true, perform Spider Scan to crawl the URL.                       |
| Boolean  | `zapScans`.ajaxspider    | If true, perform AJAX Spider Scan to the URL.                        |
| Boolean  | `zapScans`.activescan    | If true, perform Active Scan to the URL.                             |
| Object   | `seleniumTest`           | <i>Optional</i>: Selenium Test Parameters.                           |
| String   | `seleniumTest`.browser   | Choose prefered browser ('firefox' or 'chrome').                     |
| Boolean  | `seleniumTest`.headless  | Don't show browser while running the selenium test.                  |
| String   | `seleniumTest`.testPath  | Set path to the provided selenium test.                              |
| Object   | `spiderOpt`              | Spider Scan options                                                  |
| Number   | `spiderOpt`.maxchildren  | Limit the number of children scanned.                                |
| Boolean  | `spiderOpt`.recurse      | Prevent the spider from seeding recursively.                         |
| Boolean  | `spiderOpt`.subtreeonly  | Allows to restrict the spider scan under a site's subtree.           |
| Object   | `ajaxOpt`                | AJAX Spider Scan options                                             |
| Boolean  | `ajaxOpt`.subtreeonly    | Allows to restrict the ajax spider scan under a site's subtree.      |
| Number   | `ajaxOpt`.ajaxTimeout    | Max duration (in seconds) of the AJAX spider scan.                   |
| Object   | `ascanOpt`               | Active Scan options                                                  |
| Boolean  | `ascanOpt`.recurse       | Perform active scan on URLs under the given URL.                     |
