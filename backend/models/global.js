var mongoose = require('mongoose');

var globalSchema = new mongoose.Schema({
    Date_reported: Date,
    Country_code: String,
    Country: String,
    WHO_region: String,
    New_cases: Number,
    Cumulative_cases: Number,
    New_deaths: Number,
    Cumulative_deaths: Number
})

module.exports = mongoose.model('globalCases', globalSchema);