const config = require("config"); // configurations

module.exports = function () {
  if (!config.get("jwtPrivateKey")) {
    // throw new Error('ERROR: jwtPrivateKey is not defined');
  }
};
