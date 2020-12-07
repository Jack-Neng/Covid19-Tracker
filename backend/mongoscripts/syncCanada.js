const CronJob = require("cron").CronJob;
const CanadaCases = require("../models/canada");
const { downloadFile, deleteFile, readFile } = require("./util");

const debug = "59 23 * * *";

// db.canadacases.createIndex({ prname: 1, date: 1}, { unique: true })
module.exports = new CronJob(debug, async () => {
  const path = "./assets/covid19-download.csv";
  const url =
    "https://health-infobase.canada.ca/src/data/covidLive/covid19-download.csv";

  // deleteFile(path);
  var filename = await downloadFile(path, url);
  var filedata = await readFile(filename);

  // filter old data
  var data = await CanadaCases.find({});
  var dateMatch = data.map((a) => a.date.toLocaleDateString());
  var newData = filedata.filter(
    (d) => !dateMatch.includes(d.date.toLocaleDateString())
  );
  console.log("# of data: ", filedata.length);
  console.log("# of Old data: ", data.length);
  console.log("# of New data: ", newData.length);

  // update database
  var i = 1;
  for (const data of filedata) {
    await CanadaCases.updateOne(
      { prname: data.prname, date: data.date },
      data,
      { upsert: true, new: true },
      (err, doc) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`Updated ${i} of ${filedata.length} data.`);
        }
      }
    );
    i += 1;
  }

  deleteFile(filename);
});
