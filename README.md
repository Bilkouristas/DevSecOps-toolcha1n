# DevSecOps - Toolcha1n

### This is a DAST Tool using the OWASP ZAP open source project for automated security testing on the CI/CD Pipeline of Github Actions

The purpose of this tool is aimed in helping DevSecOps teams, by easily integrating Security scans in a CI/CD Pipeline environment using Github Actions. The philosophy behind this project is to help you easily integrate security testing in your CI/CD pipelines.


1) Simple Baseline Scan/ Simple Spider

Description: ZAP passively scans all HTTP messages (requests and responses) sent to the web application being tested.
Passive scanning does not change the requests nor the responses in any way and is therefore safe to use. 


Add this to your yml file in .github/workflows/myworkflow.yml

`jobs:
  zap_scan:
    runs-on: ubuntu-latest
    name: Passive Scan
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        with:
          ref: master
      - name: Passive Scan
        uses: zaproxy/action-baseline@v0.3.0
        with:
          target: 'http://localhost:your_app_port_here'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a -j -P 8090'`

Optional 
-cmd options: You can use additional command line rules in the basic scan. Check this manual for more options 'https://www.zaproxy.org/docs/docker/baseline-scan/'. In our example we use -a include the alpha passive scan rules as well, -j to use the Ajax spider in addition to the traditional one, -P 8090 specify listen port of zap proxy
-rules.tsv: You can create a rules.tsv config file that can change any rules to FAIL or IGNORE 
`10035	IGNORE	(Strict-Transport-Security Header Not Set)
10098	IGNORE	(Cross-Domain Misconfiguration)`

Based on the scan results an active issue is created in GitHub repository. The action will update the issue if it identifies any new or resolved alerts and will close the issue if all the alerts have been resolved. A detailed report is attached to the workflow run(as an artifact) to get more information regarding the identified alerts. The report is available in HTML and Markdown formats.


2) Active Scan

Description: The ZAP full scan action runs the ZAP spider against the specified target (by default with no time limit) followed by an optional ajax spider scan and then a full active scan before reporting the results. The alerts will be maintained as a GitHub issue in the corresponding repository.
WARNING this action will perform attacks on the target website. You should only scan targets that you have permission to test. You should also check with your hosting company and any other services such as CDNs that may be affected before running this action.

`jobs:
  zap_scan:
    runs-on: ubuntu-latest
    name: Scan the webapplication
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        with:
          ref: master
      - name: Active Scan
        uses: zaproxy/action-full-scan@v0.4.0
        with:
          docker_name: 'owasp/zap2docker-stable'
          target: 'http://localhost:You_app_port_here/'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'`

Add this to your yml file in .github/workflows/myworkflow.yml

3) Selenium/BDST/AJAX

Description: 

`code here`

Add this to your yml file in .github/workflows/.yml

4) API scan

It is tuned for performing scans against APIs defined by OpenAPI, SOAP, or GraphQL via either a local file or a URL.

WARNING this action will perform attacks on the target API. You should only scan targets that you have permission to test. You should also check with your hosting company and any other services such as CDNs that may be affected before running this action.

`jobs:
  zap_scan:
    runs-on: ubuntu-latest
    name: Scan the webapplication
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        with:
          ref: master
      - name: ZAP Scan
        uses: zaproxy/action-api-scan@v0.1.1
        with:
          docker_name: 'owasp/zap2docker-stable'
          format: openapi
          target: 'http://localhost:your_app_port_here'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a' `




5) *Advanced cases* Custom web hooks

Modifying Args
For the AJAX crawler you may want to target a suburl with a specific hash (http://example.com vs http://example.com/#/dashboard). You can use the zap_ajax_spider hook to intercept the arguments and modify them.

Running Scripts
There may be some standalone scripts that you want to run before crawling and scanning. You can use the hook zap_started to run some scripts before the rest of the scan runs.

Changing Configs
For some applications, there are a number of active scan scanners that you may want to disable that are not applicable for that application. Configuring your policy before the active scan using zap_active_scan hook can ensure you only run the tests you want to run.
Example
Define your hooks in a python file my-hooks.py

You define all the hooks you want to integrate with using python methods that correspond with the name of the hook. By default, ZAP scans will load hooks defined in ~/.zap_hooks.py, the CWD (post 2.9.0) or you may specify the hooks location using a command line flag --hook=my-hooks.py.

# vim my-hooks.py
# Change the zap_ajax_spider target to hit dashboard hash 
# Change the crawl_depth to 2
def zap_ajax_spider(zap, target, max_time):
  zap.ajaxSpider.set_option_max_crawl_depth(2)
  return zap, target + '#/dashboard', max_time

Run scan with hook flag

# Run baseline directly
zap-baseline.py -t https://example.com --hook=my-hooks.py

# or using Docker 
docker run -v $(pwd):/zap/wrk/:rw -t owasp/zap2docker-stable zap-baseline.py \
    -t https://www.example.com -g gen.conf -r testreport.html --hook=/zap/wrk/my-hooks.py

Example Hooks
https://github.com/zaproxy/community-scripts/tree/main/scan-hooks

### Example Usages 

For showcase purposes we test 2 common vulnerable apps the WebGoat and Juice Shop

One in Java 
One more modern in JS

2 workflows:

1)WebGoat
2)Juice Shop

