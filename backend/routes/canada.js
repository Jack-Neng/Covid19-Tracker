const CanadaCases = require("../models/canada");

const express = require("express");
const router = express.Router();

fetchCanada();
async function fetchCanada(country) {
  var match = {};
  if (country !== "Canada") {
    match = { Country: country };
  }
  var data = await CanadaCases.find().sort({ date: 1 });
  // var data = await CanadaCases.aggregate([
  //   // { $match: { prname: { $ne: 'Canada'} } },
  //   {
  //     $group: {
  //       _id: "$date",
  //       data: { $push: "$$ROOT" },
  //       cumulativeCases: { $sum: "$numtotal" },
  //       cumulativeDeaths: { $sum: "$numdeaths" },
  //       newCases: { $sum: "$numtoday" },
  //       newDeaths: { $sum: "$numdeathstoday" },
  //     },
  //   },
  //   { $sort: { _id: 1 } },
  // ]);
  // console.log(data[0].data.map(d => d.Cumulative_cases));
  return data;
}

router.get("/ca", async (req, res) => {
  var country = req.query.country;
  try {
    var data = await fetchCanada(country);
    res.send(data);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
