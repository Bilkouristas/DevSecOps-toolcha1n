const express = require("express");
const app = express();
const winston = require("winston");

require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/validation")();

// Create Server on the given Port
const port = process.env.PORT || 3001;
app.listen(port, () => winston.info(`Listening on port ${port}...`));
