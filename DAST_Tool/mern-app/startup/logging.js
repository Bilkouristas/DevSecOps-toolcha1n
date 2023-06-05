require("express-async-errors");
const { config } = require("winston");
const winston = require("winston");
require("winston-mongodb");

module.exports = function () {
  process.on("uncaughtException", (ex) => {
    console.error(ex);
    new winston.transports.Console({ colorize: true, prettyPrint: true });
    new winston.transports.File({ filename: "uncaughtEx.log" });
  });

  process.on("unhandledRejection", (ex) => {
    console.error(ex);
    new winston.transports.File({ filename: "unhandRej.log" });
  });

  winston.add(
    new winston.transports.File({
      filename: "logfile.log",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );

  winston.add(
    new winston.transports.MongoDB({
      db: config.get("MONGO_URI"),
      level: "info",
    })
  );

  //throw new Error('Test Error !')

  //new Promise.reject(new Error('Failure - Custom Error.')).then(()=> console.log('Done'));
};
