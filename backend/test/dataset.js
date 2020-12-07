const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
atlas =
  "mongodb+srv://root:test1234@mongocluster.qxj2y.mongodb.net/covid?retryWrites=true&w=majority";
local = "mongodb://localhost:27017/covid";
mongoose.connect(atlas, { useNewUrlParser: true });
const https = require("https");
const fs = require("fs");
const Excel = require("exceljs");
const GlobalCases = require("../models/global");

const download = () => {
  const path = "./assets/WHO-COVID-19-global-data.csv";
  const file = fs.createWriteStream(path);
  const request = new Promise(function (resolve, reject) {
    https.get(
      "https://covid19.who.int/WHO-COVID-19-global-data.csv",
      function (response) {
        response.pipe(file);
        file.on("finish", function () {
          file.close(() => {
            console.log("File downloaded");
            resolve(path);
          });
        });
      }
    );
  });
  return request.then((result) => result);
};
const deleteFile = (path) => {
  try {
    fs.unlinkSync(path);
    console.log("File removed");
  } catch (err) {
    console.error(err);
  }
};

fetchGlobal();
async function fetchGlobal() {
  var filename = await download();

  var dataName;
  var bulkdata = [];
  var workbook = new Excel.Workbook();
  console.log("Reading data...");
  await workbook.csv.readFile(filename).then(function (worksheet) {
    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      if (rowNumber == 1) {
        dataName = row.values.map((n) => n.replace(" ", ""));
      } else {
        var data = {};
        dataName.forEach((n, i) => {
          data[n] = row.values[i];
        });
        bulkdata.push(data);
      }
    });
  });
  console.log(bulkdata.length);

  // var data = await GlobalCases.aggregate([
  //     {
  //         $group: {
  //             _id: '$Date_reported',
  //             data: { $push: '$$ROOT' },
  //             cumulativeCases: { $sum: '$Cumulative_cases' },
  //             cumulativeDeaths: { $sum: '$Cumulative_deaths' },
  //             newCases: { $sum: '$New_cases' },
  //             newDeaths: { $sum: '$New_deaths' },
  //         }
  //     },
  //     { $sort: { _id: 1 }}
  // ]);

  // var match = data.filter(d => d.Country === 'Afghanistan')
  // var match1 = bulkdata.filter(d => d.Country === 'Afghanistan')
  var data = await GlobalCases.find({});
  var countryMatch = data.map((a) => a.Country);
  var dateMatch = data.map((a) => a.Date_reported.toLocaleDateString());

  var newData = bulkdata.filter(
    (d) =>
      !countryMatch.includes(d.Country) && !dateMatch.includes(d.Date_reported)
  );
  console.log(newData.length);

  deleteFile(filename);
}
