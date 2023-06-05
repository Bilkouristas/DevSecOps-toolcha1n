#!/usr/bin/env python
from selenium import webdriver
from axe_selenium_python import Axe
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.keys import Keys
import json
from datetime import datetime
import time
import os

# A file path with a list of urls
urls_path = "urls.txt"

# The file path to store the report to (Remove invalid characters)
report_path = f"./a11y_report_{datetime.now()}.json".replace(":", "-")

# Choose browser for Selenium
browser = "Firefox"  # Or Chrome

alert2code = {
    "minor": 1,
    "moderate": 2,
    "serious": 3,
    "critical": 4
}

with open(urls_path) as urls_file:

    # Get a list of urls from urls.txt
    url_list = [url.rstrip('\n') for url in urls_file.readlines()]

    # Results dictionary
    res = {}

    # Loop through the various urls
    for url in url_list:

        # Prepend a pound symbol to skip a url
        if url[0] == "#":
            continue

        # Selenium settings - No browser interaction

        opt = Options()
        opt.add_argument("-headless")
        if browser == "Firefox":
            driver = webdriver.Firefox(
                options=opt, service_log_path=os.devnull)
        elif browser == "Chrome":
            driver = webdriver.Chrome(options=opt, service_log_path=os.devnull)
        else:
            print("Invalid Browser!")
            exit(-1)

        # Create a file to store the report to
        report_fp = open(report_path, 'a')

        # Open url and wait for it to load
        driver.get(url)
        time.sleep(5)

        # Inject axe-core javascript into page.
        axe = Axe(driver)
        axe.inject()

        # Run axe accessibility checks.
        results = axe.run()

        # Violations Impact - Accessibility Report
        viol_impact = [viol["impact"] for viol in results["violations"]]

        # Create a dict containing the results for a given url
        res[url] = {
            "url": url,
            "accessibility": {imp: viol_impact.count(imp) for imp in ["minor", "moderate", "serious", "critical"]}
        }

        # Uncomment the following lines for a full Report

        # res[url] = {
        #     "url": url,
        #     "accessibility": results
        # }

        # Write the various results to the report file
        json.dump(res[url], report_fp)

    # Close all browser windows
    driver.quit()

    report_fp.close()
