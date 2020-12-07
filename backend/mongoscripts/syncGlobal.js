const CronJob = require("cron").CronJob;
const GlobalCases = require("../models/global");
const { downloadFile, deleteFile, readFile } = require("./util");

const debug = "55  20 * * *";

// db.globalcases.createIndex({ Country: 1, Date_reported: 1}, { unique: true })
module.exports = new CronJob(debug, async () => {
  const path = "./assets/WHO-COVID-19-global-data.csv";
  const url = "https://covid19.who.int/WHO-COVID-19-global-data.csv";

  // delete existing file
  deleteFile(path);
  var filename = await downloadFile(path, url);
  var filedata = await readFile(filename);

  // filter old data
  var data = await GlobalCases.find({});
  var dateMatch = data.map((a) => a.Date_reported.toLocaleDateString());
  var newData = filedata;
  //   var newData = filedata.filter(
  //     (d) => !dateMatch.includes(d.Date_reported.toLocaleDateString())
  // );
  console.log("# of data: ", filedata.length);
  console.log("# of Old data: ", data.length);
  console.log("# of New data: ", newData.length);

  // update new data to mongo
  var i = 1;
  for (const data of newData) {
    await GlobalCases.updateOne(
      { Country: data.Country, Date_reported: data.Date_reported },
      data,
      { upsert: true, new: true },
      (err, doc) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`Updated ${i} of ${newData.length} data.`);
        }
      }
    );
    i += 1;
  }

  // delete file
  deleteFile(filename);
});
