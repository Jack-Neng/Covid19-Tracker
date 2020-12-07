import React from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
require("highcharts/modules/map")(Highcharts);

const MapChart = ({ options }) => (
  <HighchartsReact
    highcharts={Highcharts}
    constructorType={"mapChart"}
    options={options}
  />
);
export default MapChart;
