# ZAP Scripts (Experimental)

## Description

Scripts to capture the JWT token and set it into the local storage of the browser before every AJAX spider scan test.

## Instructions

The scripts must be loaded in ZAP's corresponding script category.

1. Open OWASP ZAP and from the menu click `View` -> `Show Tab` -> `Scripts Tab`.
2. From the script's sidebar click the `HTTP Sender` category and press the folder icon above, to load a script.
3. Add the `httpSender_getJWT.js` script as an ECMAScript Oracle Nashorn script and check the `Load on Start` checkbox.
4. From the sidebar click the `Selenium` category and press the folder icon above, to load a script.
5. Add the `selenium_useJWT.js` script as an ECMAScript Oracle Nashorn script and check the `Load on Start` checkbox.
6. Finaly, right click on each of the two scripts and enable them.

\*\* You might need to tweak these scripts depending on the target url you want to test.

## Usage - Script Explanation

To use the scripts, just open a browser proxying ZAP, and add your credentials. The first script will capture the JWT token contained in the response body of a request if the substring "Bearer" is found in it.

Then close the browser. When the AJAX spider scan starts the selenium script will be run to set the JWT in the localstorage by running a command in the console of the browser.
