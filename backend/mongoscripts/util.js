const https = require("https");
const fs = require("fs");
const Excel = require("exceljs");

const downloadFile = async (path, url) => {
  // const path = "./assets/WHO-COVID-19-global-data.csv";
  // const url = "https://covid19.who.int/WHO-COVID-19-global-data.csv";
  const file = fs.createWriteStream(path);
  const request = new Promise(function (resolve, reject) {
    https.get(url, function (response) {
      response.pipe(file);
      file.on("finish", function () {
        file.close(() => {
          console.log("File downloaded");
          resolve(path);
        });
      });
    });
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

const readFile = async (filename) => {
  var dataName;
  var filedata = [];
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
        filedata.push(data);
      }
    });
  });
  return filedata;
};

module.exports = { downloadFile, deleteFile, readFile };
