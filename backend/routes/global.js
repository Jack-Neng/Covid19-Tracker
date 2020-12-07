const GlobalCases = require("../models/global");

const express = require("express");
const router = express.Router();

// fetchGlobal();
async function fetchGlobal(country) {
  var match = {};
  if (country !== "Global") {
    match = { Country: country };
  }
  var data = await GlobalCases.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$Date_reported",
        data: { $push: "$$ROOT" },
        cumulativeCases: { $sum: "$Cumulative_cases" },
        cumulativeDeaths: { $sum: "$Cumulative_deaths" },
        newCases: { $sum: "$New_cases" },
        newDeaths: { $sum: "$New_deaths" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  //   console.log(data);
  return data;
}

router.get("/who", async (req, res) => {
  var country = req.query.country;
  try {
    var data = await fetchGlobal(country);
    res.send(data);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
