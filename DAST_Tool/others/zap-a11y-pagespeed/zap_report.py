#!/usr/bin/env python
from zapv2 import ZAPv2
import time
from datetime import datetime
import json
import subprocess

# A file path with a list of urls
urls_path = "urls.txt"

# The file path to store the report to
report_path = f"zap_report_{datetime.now()}.json".replace(":", "-")

# 1. OWASP ZAP must be installed
# 2. Proxy must be configured
# 3. API Key must be configured
# ( 4. ZAP Certificate must be installed )
zap_path = "/usr/share/zaproxy/zap.sh"
proxy_path = "http://127.0.0.1:8090"
api_key = "1270018090"

# Tests to perform
params = {
    "spider": True,
    "ajaxspider": False,
    "passive": True,
    "active": False
}

alert2code = {
    "Informational": 0,
    "Low": 1,
    "Medium": 2,
    "High": 3
}

# Run ZAP as a daemon process
zap_proc = subprocess.Popen([zap_path, "-daemon"],
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(10)

# Create a zap instance
zap = ZAPv2(apikey=api_key, proxies={"http": proxy_path, "https": proxy_path})


with open(urls_path) as urls_fp:

    # Create a file to store the report to
    report_fp = open(report_path, mode='a', encoding='utf-8')

    # Get a list of urls from urls.txt
    url_list = [url.rstrip('\n') for url in urls_fp.readlines()]

    # Results dictionary
    res = {}

    # Loop through the various urls
    for url in url_list:

        # Prepend a pound symbol to skip a url
        if url[0] == "#":
            continue

        # Open target url and wait for it to load
        zap.urlopen(url)
        time.sleep(2)

        # Spider scan
        if params["spider"] == True:
            zap.spider.scan(url=url, apikey=api_key)
            while int(zap.spider.status()) < 100:
                time.sleep(5)

        # Ajax spider scan
        if params["ajaxspider"] == True:
            zap.ajaxSpider.scan(url=url, inscope=None)
            while (zap.ajaxSpider.status != 'stopped'):
                time.sleep(5)

        # Passive scan
        if params["passive"] == True:
            while int(zap.pscan.records_to_scan) > 0:
                time.sleep(5)

        # Active scan
        if params["active"] == True:
            zap.ascan.scan(url=url, apikey=api_key)
            while int(zap.ascan.status()) < 100:
                time.sleep(5)

        # Create a dict containing the results for a given url
        res[url] = {
            "url": url,
            "active/passive": zap.core.alerts_summary(baseurl=url) if params["active"] is True or params["passive"] is True else ""
        }

        # Uncomment the following lines for a full Report

        # res[url] = {
        #     "url": url,
        #     "scans": {
        #         "spider": zap.spider.results() if params["spider"] is True else "",
        #         "ajaxspider": zap.ajaxSpider.results(start=0, count=10) if params["ajaxspider"] is True else "",
        #         "active/passive": zap.core.alerts(baseurl=url) if params["active"] is True or params["passive"] is True else ""
        #     }
        # }

        # Write the various results to the report file
        json.dump(res[url], report_fp)

# Terminate deamon process
zap.core.shutdown()
zap_proc.terminate()

report_fp.close()
