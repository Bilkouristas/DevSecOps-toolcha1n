# mern-app

## How to run the app

You need to have Node.js (tested on versions 12.18 and 14.15) and MongoDB (Compass) installed. In order to run the backend, you must also have JAVA (JDK) installed. You might also need to start the `mongod` service.

1. Download OWASP ZAP by following the Windows instructions in the comments of the `download_zap_2.9.0.sh` script or by running it on Linux:

```bash
    # Give executable permissions to the script.
    chmod +x download_zap_2.9.0.sh
    # Run the script.
    ./download_zap_2.9.0.sh
```

2. To run Selenium you need to download the appropriate [chrome-driver](https://chromedriver.chromium.org/downloads) (for Google Chrome) and/or [gecko-driver](https://github.com/mozilla/geckodriver/releases) (for Mozilla Firefox) based on your browser's version and add those files in PATH for [Windows](https://helpdeskgeek.com/windows-10/add-windows-path-environment-variable/) or for Linux:

```bash
    # Copy the driver using root permissions
    sudo cp /path/to/driver /usr/local/bin
```

3. To install the backend dependencies browse to the `mern-app` and run:

```bash
    npm i
```

4. To install the frontend dependencies browse to the `mern-app/react-app` and run:

```bash
    npm i
```

5. Head to frontend's `config.json` file in `mern-app/react-app/src/config.json` to add your backend's IP address. Then head to backend's config file in `mern-app/config/default.json` to add your mongodb URI. (For `Windows` OS only) Change the path of the `ZAP_PATH` from `.sh` to `.bat` as follows:

```javascript
    "ZAP_PATH": "../ZAP_2.9.0/zap.bat",
```

6. To run the full web app browse to the `mern-app` and run (frontend on port 3000):

```bash
    npm run dev
```

or to just run the backend api service (without the frontend), run:

```bash
    npm start
```

7. (Optional) For any additional ZAP settings change the code of the `/startscan` route, in `mern-app/routes/reports.js`.

## Docker

This project contains multiple `Dockerfile` files as well as the main `docker-compose.yaml` file. It is recommended that you have `MongoDB` installed. If you don't, you need to uncomment the commented areas in the `mern-app/docker-compose.yaml` file. If you want to run the whole app, head to `mern-app` and run:

```bash
docker-compose up
```

There is a chance that you need to tweak the settings in the `docker-compose.yaml` file.

# Routes

The routes of the backend service are listed below.

- `/`: Home route that contains:
  - `GET /`: Just a simple message.
- `/api/reports`: Reports route that contains:
  - `GET /api/reports/`: Array that contains information for all the report-entries.
  - `GET /api/reports/:id`: Full report of the entry with the given `id`.
  - `GET /api/reports/:id/:name/:risk`: Alerts of the given report category.
  - `POST /api/reports/upload`: Upload route to receive a selenium mocha js test file if provided.
  - `POST /api/reports/sendreport`: Route to receive manually created zap reports produced by ZAP as strings.
  - `POST /api/reports/startscan`: Route to start a ZAP scan using a UI form.

# Examples of use

## Using the provided form

We will be using the Damn Vulnerable Web Application (DVWA) as a target app (written in PHP). After following the `How to run the app` instructions do the following:

1. Install the DVWA app manually or run the corresponding docker container (recommended) on port `8070`.
2. Connect with credentials `username`:`admin`, `password`:`password`, create the database as it is the first time of use and logout.
3. Start a browser and visit `http://localhost:3000` which is our frontend.
4. In the `Taget URL` input field enter: `http://localhost:8070` (DVWA Address) and then check the `Selenium Test` checkbox. Upload the selenium test file `exampleSeleniumTestDVWA.js` found in `mern-app/zapscanner/example_files` which was produced using the `Selenium IDE` addon for google chrome. You might need to change the URL in the test file.
5. Check the spider and active scan checkboxes.
6. Exlude the following links from scans:
   - `/logout.php` - To avoid logout during spidering.
   - `/vulnerabilities/csrf` - To avoid changing password during spidering.
   - `/vulnerabilities/captcha` - To avoid changing password during spidering.
7. Click `Submit` and wait until you see a toast notification (hopefully successful).
8. Check the `reports` tab to see your report.

## Manual creation of ZAP reports

We will be using the Damn Vulnerable Web Application (DVWA) as a target app (written in PHP). After following the `How to run the app` instructions do the following:

1. Install the DVWA app manually or run the corresponding docker container (recommended) on port `8070`.
2. Connect with credentials `username`:`admin`, `password`:`password`, create the database as it is the first time of use and logout.
3. Start a browser and visit `http://localhost:3000/reports` which is our frontend.
4. Run ZAP manually and perform any tests (zap proxy: `http://localhost:8090`). To extract the reports open a browser and visit the following locations:

   - Spider: `http://localhost:8090/JSON/spider/view/results/?baseurl=http://localhost:8070/`
   - AJAX Spider: `http://localhost:8090/JSON/ajaxSpider/view/results/?baseurl=http://localhost:8070/`
   - Active/Pasive Scan: `http://localhost:8090/JSON/core/view/alerts/?baseurl=http://localhost:8070/`

The ZAP API will respond with a JSON file in each case. Save the JSON files you need and upload them in the `mern-app`. Check the `active scan used` checkbox if `active scanning` were used.

5. Check `mern-app/zapscanner/example_files` for the `exampleSpiderReport.json` and `exampleActiveScanReport.json` files and upload them to the `mern-app` as an example.
