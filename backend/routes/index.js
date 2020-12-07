const express = require("express");
const app = express();

app.use("/", require("./canada.js"));
app.use("/", require("./global.js"));

module.exports = app;
