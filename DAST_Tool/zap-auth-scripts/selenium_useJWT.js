// This script will log a browser into Juice Shop when forced user mode is enabled.
// The 'Juice Shop Session Management.js' script must have been set to authenticate correctly.
// The version of that script included with ZAP 2.9.0 also needs to be be tweaked to add the 2 lines indicated below:

/*

var ScriptVars = Java.type('org.zaproxy.zap.extension.script.ScriptVars');	// <-- Add this line

function extractWebSession(sessionWrapper) {
	// parse the authentication response
	var json = JSON.parse(sessionWrapper.getHttpMessage().getResponseBody().toString());
	var token = json.authentication.token;
	// save the authentication token
	sessionWrapper.getSession().setValue("token", token);
	ScriptVars.setGlobalVar("juiceshop.token", token);	// <-- Add this line
}
    	
function clearWebSessionIdentifiers(sessionWrapper) {
	var headers = sessionWrapper.getHttpMessage().getRequestHeader();
	headers.setHeader("Authorization", null);
	ScriptVars.setGlobalVar("juiceshop.token", null);	// <-- Add this line
}
*/

var ScriptVars = Java.type('org.zaproxy.zap.extension.script.ScriptVars');

function browserLaunched(ssutils) {

     var globalJsonWithToken = ScriptVars.getGlobalVar("jsonWithToken");

     if (globalJsonWithToken != null){

        logger(globalJsonWithToken);
        var jsonWithToken = JSON.parse(globalJsonWithToken);
        var tokenKey = "user";
        var token = JSON.stringify(jsonWithToken[tokenKey]);

        logger(tokenKey);
        logger(token);

        if (token != null) { 
            logger('browserLaunched ' + ssutils.getBrowserId());
            var wd = ssutils.getWebDriver();
            ssutils.waitForURL(5000);
            var script = "window.localStorage.setItem('user', '" + token + "')";
            wd.executeScript(script);
        } else {
            logger('no token defined');
        }
    }
}

// Logging with the script name is super helpful!
function logger() {
    print('[' + this['zap.script.name'] + '] ' + arguments[0]);
}
