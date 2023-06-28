# DevSecOps - Toolcha1n

Description
=============

This is a complete pipeline security DevSecOps toolchain, from Component Analysis and Static Code Testing to Dynamic and Blackbox Application Testing.

Table of contents
=================

<!--ts-->
   * [SCA (Security Component Analysis)](#sca-security-component-analysis)
      * [Dependabot](#sca-security-component-analysis)
   * [SAST (Static Application Security Testing)](#sast-static-analysis-security-testing)
      * [CodeQL](#sast-static-application-security-testing)
   * [DAST (Dynamic Application Security Testing)](#dast-dynamic-application-security-testing)
      * [Baseline Scan](#simple-baseline-scan-simple-spider)
      * [Active Scan](#active_scan)
      * [Selenium/BDST/AJAX spider](#selenium-bdst-ajax-spider)
      * [API scan](#api-scan)
      * [Advanced cases](#advanced-cases-custom-web-hooks)
   * [Example usages](#example-usages)
<!--te-->

SCA (Security Component Analysis)
=================

(**_Used Tool_: Dependabot**/_Alternatives_: OWASP Dependencies Check, FOSSA, Snyk)

**Description**: Dependabot will scan your GitHub repository dependancies, their versions and any vulnerabilities related to them and submit PRs to update your dependencies.

Automatically enable Dependabot on the Security tab on your github repo or alternatively, for manual setup create a file named `dependabot.yml` inside `.github` folder and paste this content into it:

```yml
version: 2
updates:
    - package-ecosystem: "composer"
      directory: "/" # Location of package manifests
      schedule:
          interval: "daily"
```

If you’re working with Yarn or NPM for example, replace the value of package-ecosystem by “yarn” or “npm”.
More ecosystems like Gradle (Java), Cargo (Rust), GoMod (Golang), Bundle (Ruby), etc are supported. For the official documentation of supported ecosystems follow this link 
[package-ecosystems](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file#package-ecosystem)

SAST (Static Application Security Testing)
=================

(**_Used Tool_: CodeQL**/_Alternatives_: Sonarqube, Checkmarx, Snyk Code)

**Description**: CodeQL is a Github Tool made for scanning and analyzing the code in a GitHub repository to find security vulnerabilities and coding errors. 

You can use code scanning to find, triage, and prioritize fixes for existing problems in your code. Code scanning also prevents developers from introducing new problems. You can schedule scans for specific days and times, or trigger scans when a specific event occurs in the repository, such as a push.

If code scanning finds a potential vulnerability or error in your code, GitHub displays an alert in the repository. After you fix the code that triggered the alert, GitHub closes the alert. 

Automatically enable CodeQL on the Security tab on your github repo or alternatively, for manual setup create a file named `dependabot.yml` inside `.github/workflows` folder and paste this content into it:

(You can either set the codeql workflow to run on a trigger or schedule it on a time basis for efficiency(e.g weekly) with _cron_ utility)
```yml
name: "CodeQL"

on:
  push:
    branches: [ "master" ]
  pull_request:
    # The branches below must be a subset of the branches above
    branches: [ "master" ]
  schedule:
    - cron: '30 22 * * 6'

jobs:
  analyze:
    name: Analyze
    runs-on: ${{ (matrix.language == 'swift' && 'macos-latest') || 'ubuntu-latest' }}
    timeout-minutes: ${{ (matrix.language == 'swift' && 120) || 360 }}
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: [ 'java', 'javascript', 'python' ]
        # CodeQL supports [ 'cpp', 'csharp', 'go', 'java', 'javascript', 'python', 'ruby', 'swift' ]
        # Use only 'java' to analyze code written in Java, Kotlin or both
        # Use only 'javascript' to analyze code written in JavaScript, TypeScript or both
        # Learn more about CodeQL language support at https://aka.ms/codeql-docs/language-support

    steps:
    - name: Checkout repository
      uses: actions/checkout@v3

    # Initializes the CodeQL tools for scanning.
    - name: Initialize CodeQL
      uses: github/codeql-action/init@v2
      with:
        languages: ${{ matrix.language }}
        # If you wish to specify custom queries, you can do so here or in a config file.
        # By default, queries listed here will override any specified in a config file.
        # Prefix the list here with "+" to use these queries and those in the config file.

        # For more details on CodeQL's query packs, refer to: https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/configuring-code-scanning#using-queries-in-ql-packs
        # queries: security-extended,security-and-quality


    # Autobuild attempts to build any compiled languages (C/C++, C#, Go, Java, or Swift).
    # If this step fails, then you should remove it and run the build manually (see below)
    - name: Autobuild
      uses: github/codeql-action/autobuild@v2

    # ℹ️ Command-line programs to run using the OS shell.
    # 📚 See https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstepsrun

    #   If the Autobuild fails above, remove it and uncomment the following three lines.
    #   modify them (or add more) to build your code if your project, please refer to the EXAMPLE below for guidance.

    # - run: |
    #     echo "Run, Build Application using script"
    #     ./location_of_script_within_repo/buildscript.sh

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v2
      with:
        category: "/language:${{matrix.language}}"
```



DAST (Dynamic Application Security Testing)
=================

This is a DAST Tool using the OWASP ZAP open source project for automated security testing on the CI/CD Pipeline of Github Actions
-------------

The purpose of this tool is aimed in helping DevSecOps teams, by easily integrating Security scans in a CI/CD Pipeline environment using Github Actions. The philosophy behind this project is to help you easily implement security testing in your CI/CD pipelines.


1. ### Simple Baseline Scan/ Simple Spider

**Description**: ZAP passively scans all HTTP messages (requests and responses) sent to the web application being tested.
Passive scanning does not change the requests nor the responses in any way and is therefore safe to use. 


Add this to your yml file in `.github/workflows/myworkflow.yml`

```yml
jobs:
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
          cmd_options: '-a -j -P 8090'
```


_Optional_ 
- _cmd options_: You can use additional command line rules in the basic scan. Check this manual for more options 'https://www.zaproxy.org/docs/docker/baseline-scan/'. In our example we use -a include the alpha passive scan rules as well, -j to use the Ajax spider in addition to the traditional one, -P 8090 specify listen port of zap proxy
- _rules.tsv_: You can create a rules.tsv config file that can change any rules to FAIL or IGNORE 
```json
10035	IGNORE	(Strict-Transport-Security Header Not Set)
10098	IGNORE	(Cross-Domain Misconfiguration)
```

Based on the scan results an active issue is created in GitHub repository. The action will update the issue if it identifies any new or resolved alerts and will close the issue if all the alerts have been resolved. A detailed report is attached to the workflow run(as an artifact) to get more information regarding the identified alerts. The report is available in HTML and Markdown formats.


2. ### Active Scan

**Description**: The ZAP full scan action runs the ZAP spider against the specified target (by default with no time limit) followed by an optional ajax spider scan and then a full active scan before reporting the results. The alerts will be maintained as a GitHub issue in the corresponding repository.

_WARNING_ this action will perform attacks on the target website. You should only scan targets that you have permission to test. You should also check with your hosting company and any other services such as CDNs that may be affected before running this action.

```yml
jobs:
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
          cmd_options: '-a' 
```

Add this to your yml file in `.github/workflows/myworkflow.yml`

3. ### Selenium/BDST/AJAX spider

**Description**: The AJAX Spider add-on integrates in ZAP a crawler of AJAX rich sites called Crawljax. You can use it to identify the pages of the targeted site. You can combine it with the (normal) spider for better results. The AJAX Spider allows you to crawl web applications written in AJAX in far more depth than the native Spider.

```yml
jobs:
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
          cmd_options: '-j'
```

Add this to your yml file in `.github/workflows/.yml`, the `-j` cmd_option is for enabling the ajax spider in your scan.

4. ### API scan

It is tuned for performing scans against APIs defined by OpenAPI, SOAP, or GraphQL via either a local file or a URL.

_WARNING_ this action will perform attacks on the target API. You should only scan targets that you have permission to test. You should also check with your hosting company and any other services such as CDNs that may be affected before running this action.

```yml
jobs:
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
          cmd_options: '-a' 
```




5. ### * *Advanced cases* * Custom web hooks

Modifying Args
For the AJAX crawler you may want to target a suburl with a specific hash (http://example.com vs http://example.com/#/dashboard). You can use the zap_ajax_spider hook to intercept the arguments and modify them.

**Running Scripts**
There may be some standalone scripts that you want to run before crawling and scanning. You can use the hook zap_started to run some scripts before the rest of the scan runs.

**Changing Configs**
For some applications, there are a number of active scan scanners that you may want to disable that are not applicable for that application. Configuring your policy before the active scan using zap_active_scan hook can ensure you only run the tests you want to run.
Example
Define your hooks in a python file my-hooks.py

You define all the hooks you want to integrate with using python methods that correspond with the name of the hook. By default, ZAP scans will load hooks defined in ~/.zap_hooks.py, the CWD (post 2.9.0) or you may specify the hooks location using a command line flag --hook=my-hooks.py.
```python
# vim my-hooks.py
# Change the zap_ajax_spider target to hit dashboard hash 
# Change the crawl_depth to 2
def zap_ajax_spider(zap, target, max_time):
  zap.ajaxSpider.set_option_max_crawl_depth(2)
  return zap, target + '#/dashboard', max_time
```
Run scan with hook flag

Run baseline directly
```bash
zap-baseline.py -t https://example.com --hook=my-hooks.py
```

or using Docker 
```bash
docker run -v $(pwd):/zap/wrk/:rw -t owasp/zap2docker-stable zap-baseline.py \
    -t https://www.example.com -g gen.conf -r testreport.html --hook=/zap/wrk/my-hooks.py
```

_Example Hooks_
https://github.com/zaproxy/community-scripts/tree/main/scan-hooks

### Example Usages 

For showcase purposes we test 2 common OWASP vulnerable apps the WebGoat and Juice Shop(the continuation project of bodgeit store)

WebGoat is older and thus written in Java 
Juice Shop is more modern and thus written in JS

2 workflows:

1) WebGoat




2) Juice Shop


   - SCA

     Implemented dependabot on Juice Shop source code and we get the following alerts on the security tab:

     ![alt text](https://github.com/Bilkouristas/DevSecOps-toolcha1n/blob/master/Tests/Juice%20Shop/JuicerShop_SCA.png)

   - SAST

     Implemented CodeQL on Juice Shop source code and we get the following alerts on the security tab:

     ![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png)


   - DAST

     Implemented the ZAP actions tool in the pipeline to dynamically test Juice Shop while up and running as a blackbox. The results for both the basic and the active/full scan can be found on the [Tests folder](/DevSecOps-toolcha1n/tree/master/Tests)



