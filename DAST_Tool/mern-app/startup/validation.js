const Joi = require('joi'); // Validate req body

module.exports = function(){
    Joi.objectId = require('joi-objectid')(Joi); // Validate obj id
}