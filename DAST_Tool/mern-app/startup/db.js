const mongoose = require("mongoose");
const winston = require("winston");
const config = require("config");

module.exports = function () {
  // Connect to mongo db - promise
  mongoose
    .connect(config.get("MONGO_URI"), {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    .then(() => winston.info("Connected to MongoDB..."));
};
