const Joi = require("joi");
const mongoose = require("mongoose");

const Report = mongoose.model(
  "Report",
  new mongoose.Schema({
    url: {
      type: String,
      required: true,
    },
    zapScans: {
      type: Object,
      required: true,
    },
    spiderResults: {
      type: Object,
      required: false,
    },
    ajaxSpiderResults: {
      type: Object,
      required: false,
    },
    scanResults: {
      type: Object,
      required: false,
    },
    seleniumInfo: {
      type: Object,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
  })
);

function validateReport(report) {
  const schema = Joi.object({
    url: Joi.string().min(3).required(),
    // zapProcOpt: Joi.object({
    //   runAsDaemon: Joi.boolean().required(),
    //   zapPath: Joi.string().min(3).required(),
    // }).required(),
    // zapOpt: Joi.object({
    //   proxy: Joi.string().min(3).required(),
    // }).required(),
    zapScans: Joi.object({
      spider: Joi.boolean().required(),
      ajaxspider: Joi.boolean().required(),
      activescan: Joi.boolean().required(),
    }).required(),
    includeURLs: Joi.array().required(),
    excludeURLs: Joi.array().required(),
    seleniumTest: Joi.object({
      browser: Joi.string().min(3).required(),
      headless: Joi.boolean().required(),
      testPath: Joi.boolean().required(),
    }),
    spiderOpt: Joi.object({
      maxchildren: Joi.number().required(),
      subtreeonly: Joi.boolean().required(),
      recurse: Joi.boolean().required(),
    }).allow(null),
    ajaxOpt: Joi.object({
      subtreeonly: Joi.boolean().required(),
      ajaxTimeout: Joi.number().required(),
    }).allow(null),
    ascanOpt: Joi.object({
      recurse: Joi.boolean().required(),
    }).allow(null),
  });

  return schema.validate(report);
}

function validateManualReport(report) {
  const schema = Joi.object({
    url: Joi.string().min(3).required(),
    zapScans: Joi.object({
      spider: Joi.boolean().required(),
      ajaxspider: Joi.boolean().required(),
      activescan: Joi.boolean().required(),
    }).required(),
    spiderResults: Joi.string().allow(null),
    ajaxSpiderResults: Joi.string().allow(null),
    scanResults: Joi.string().allow(null),
  });

  return schema.validate(report);
}

module.exports = { Report, validateReport, validateManualReport };
