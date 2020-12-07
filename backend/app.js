const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
atlas =
  "mongodb+srv://root:test1234@mongocluster.qxj2y.mongodb.net/covid?retryWrites=true&w=majority";
local = "mongodb://localhost:27017/covid";
mongoose.connect(process.env.MONGODB_URI || local, {
  useNewUrlParser: true,
});

const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 5000;

const routes = require("./routes/index.js");
const cors = require("cors");

app.use(cors());
app.use("/", routes);
app.use(bodyParser.json);

//start the web server
app.listen(PORT, () => console.log("server started"));

// CronJobs to sync data
var syncGlobalCronJob = require("./mongoscripts/syncGlobal");
syncGlobalCronJob.start();

var syncCanadaCronJob = require("./mongoscripts/syncCanada");
syncCanadaCronJob.start();
