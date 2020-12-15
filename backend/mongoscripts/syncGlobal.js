const CronJob = require("cron").CronJob;
const GlobalCases = require("../models/global");
const { downloadFile, deleteFile, readFile } = require("./util");

const debug = "23 18 * * *";
const everyHour = "30 * * * *";

// db.globalcases.createIndex({ Country: 1, Date_reported: 1}, { unique: true })
module.exports = new CronJob(everyHour, async () => {
  const path = "./assets/WHO-COVID-19-global-data.csv";
  const url = "https://covid19.who.int/WHO-COVID-19-global-data.csv";

  // delete existing file
  deleteFile(path);
  var filename = await downloadFile(path, url);
  var filedata = await readFile(filename);

  // // filter old data
  // var data = await GlobalCases.find({});
  // var dateMatch = data.map((a) => a.Date_reported.toLocaleDateString());
  // var newData = filedata.filter(
  //  (d) => !dateMatch.includes(d.Date_reported.toLocaleDateString())
  // );
  console.log("# of data: ", filedata.length);
  // console.log("# of Old data: ", data.length);
  // console.log("# of New data: ", newData.length);

  // update new data to mongo
  var queryArr = filedata.map((data) => ({
    updateOne: {
      filter: { Country: data.Country, Date_reported: data.Date_reported },
      update: data,
      upsert: true,
    },
  }));
  await GlobalCases.bulkWrite(queryArr)
    .then((result) => {
      console.log("Update successfully");
      // console.log(JSON.stringify(result, null, 2));
    })
    .catch((err) => {
      console.log("Update error");
      console.log(JSON.stringify(err, null, 2));
    });

  // delete file
  deleteFile(filename);
});
