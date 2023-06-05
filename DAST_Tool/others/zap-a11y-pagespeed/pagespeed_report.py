#!/usr/bin/env python
import requests
import json
from datetime import datetime
from urllib import parse

# A file path with a list of urls
urls_path = "urls.txt"

# The file path to store the report to
report_path = f"./pagespeed_report_{datetime.now()}.json".replace(":", "-")

# The parameters to search for. For more params check:
# https://developers.google.com/speed/docs/insights/v5/reference/pagespeedapi/runpagespeed
params = {
    # "apikey": "",
    "category": {
        "accessibility": True,
        "best-practices": True,
        "performance": False,
        "pwa": False,
        "seo": False
    },
    # for other locales: `cat /usr/share/i18n/SUPPORTED`
    "locale": "en-US",
    # strategy can be either "desktop" (default) or "mobile"
    "strategy": "desktop"
}


with open(urls_path) as urls_fp:
    # Create a file to store the report to
    report_fp = open(report_path, 'w')

    # Get a list of urls from urls.txt
    url_list = [url.rstrip('\n') for url in urls_fp.readlines()]

    # Remove keys with a value of False from params
    [v.pop(nk) for (k, v) in list(params.items()) if isinstance(v, dict)
     for (nk, nv) in list(v.items()) if nv == False]

    # Set base pagespeedonline url
    api_url = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'

    # Results dictionary
    res = {}

    # Loop through the various urls
    for url in url_list:

        # Prepend a pound symbol to skip a url
        if url[0] == "#":
            continue

        # Make a request to the API
        req = requests.get(
            f'{api_url}?url={url}' + (f'&{parse.urlencode(params, doseq=True)}' if params != {} else ''))

        # Create a dict containing the results for a given url
        res[url] = {
            "url": url,
            "scan": req.json()
        }

        # Write the various results to the report file
        json.dump(res[url], report_fp)

    report_fp.close()
