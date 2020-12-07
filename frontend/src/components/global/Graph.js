import React, { Component } from "react";
import { ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import mapData from "../../api/worldMapData.js";
import MapChart from "../highcharts/Map";
import HighchartsReact from "react-highcharts";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";

import { formatNumber } from "../../utils";
import { API_BASE_URL } from "../../constants";

import Axios from "axios";

import "./Graph.css";

const SeriesPill = ({ toggleName, onNew, onCum }) => (
  <ToggleButtonGroup type="radio" name="toggle" defaultValue={1}>
    <ToggleButton
      type="radio"
      variant="outline-info"
      name="radio"
      value={1}
      onClick={onNew}
      className="toggle"
    >
      {toggleName[0]}
    </ToggleButton>
    <ToggleButton
      type="radio"
      variant="outline-info"
      name="radio"
      value={2}
      onClick={onCum}
      className="toggle"
    >
      {toggleName[1]}
    </ToggleButton>
  </ToggleButtonGroup>
);
class Graph extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mapOptions: {
        title: {
          text: "",
        },
        colorAxis: {
          min: 0,
          stops: [
            [0, "#95DCF4"],
            [0.33, "#00ACE3"],
            [1, "#007092"],
          ],
        },
        mapNavigation: {
          enabled: true,
          enableDoubleClickZoomTo: true,
          enableMouseWheelZoom: false,
          buttonOptions: {
            verticalAlign: "bottom",
          },
        },
        legend: {
          enabled: false,
        },
        //   tooltip: {
        //     pointFormatter: function () {
        //       return this.properties["woe-label"].split(",")[0];
        //     },
        //   },
        series: [],
      },
      caseChartOptions: {
        chart: {
          height: 250,
          type: "column",
        },
        xAxis: {
          type: "datetime",
          // labels: { enabled: false},
          // tickWidth: 0,
          tickInterval: 30 * 24 * 3600 * 1000,
          dateTimeLabelFormats: { month: "%b %Y" },
        },
        yAxis: {
          opposite: true,
          min: 0,
          title: { text: "" },
          lineWidth: 1,
          gridLineWidth: 0,
          endOnTick: false,
        },
        title: { text: "" },
        // legend: {
        //     enabled: false
        // },
      },
      deathChartOptions: {
        chart: {
          height: 250,
          type: "column",
        },
        colors: ["#C3591D"],
        xAxis: {
          type: "datetime",
          // labels: { enabled: false},
          // tickWidth: 0,
          tickInterval: 30 * 24 * 3600 * 1000,
          dateTimeLabelFormats: { month: "%b %Y" },
        },
        yAxis: {
          opposite: true,
          min: 0,
          title: { text: "" },
          lineWidth: 1,
          gridLineWidth: 0,
          endOnTick: false,
        },
        title: { text: "" },
        // legend: {
        //     enabled: false
        // },
      },
      hoverData: null,
      countryList: [],
      cumCaseSeries: [],
      cumDeathSeries: [],
      newCaseSeries: [],
      newDeathSeries: [],
      latest: {},
      search: "",
    };
  }

  getData = async (country) => {
    const res = await Axios.get(`${API_BASE_URL}/who`, {
      params: { country },
    });
    return res.data;
  };
  updateChart = (data) => {
    function getUTC(dateString) {
      var date = new Date(dateString);
      var UTC = Date.UTC(
        date.getFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
      );
      return UTC;
    }
    var cumCase = data.map((d) => [getUTC(d._id), d.cumulativeCases]);
    var cumDeath = data.map((d) => [getUTC(d._id), d.cumulativeDeaths]);
    var newCase = data.map((d) => [getUTC(d._id), d.newCases]);
    var newDeath = data.map((d) => [getUTC(d._id), d.newDeaths]);

    var cumCaseSeries = [{ name: "Cumulative Cases", data: cumCase }];
    var cumDeathSeries = [{ name: "Cumulative Deaths", data: cumDeath }];
    var newCaseSeries = [{ name: "New Cases", data: newCase }];
    var newDeathSeries = [{ name: "New Deaths", data: newDeath }];
    this.setState({
      cumCaseSeries,
      cumDeathSeries,
      newCaseSeries,
      newDeathSeries,
    });
    this.updateCaseGraph(false);
    this.updateDeathGraph(false);
  };

  updateMapData = (data) => {
    var latest = data[data.length - 1];
    this.setState({ latest });
    this.updateMap(0);
  };

  setupCountryList = (data) => {
    var countryList = data[0].data.map((d) => d.Country);
    this.setState({
      countryList: countryList,
    });
  };

  async componentDidMount() {
    var data = await this.getData("Global");
    this.setupCountryList(data);
    this.updateMapData(data);
    this.updateChart(data);
  }

  updateMap = (seriesIndex) => {
    var series = [
      "Cumulative_cases",
      "Cumulative_deaths",
      "New_cases",
      "New_deaths",
    ];

    this.setState((prevState) => ({
      mapOptions: {
        ...prevState.mapOptions,
        colorAxis: {
          min: 0,
          stops: [
            [0, seriesIndex === 0 ? "#95DCF4" : "#FFEDC1"],
            [0.33, seriesIndex === 0 ? "#00ACE3" : "#D86422"],
            [1, seriesIndex === 0 ? "#007092" : "#994414"],
          ],
        },
        series: {
          mapData: mapData,
          dataLabels: {
            formatter: function () {
              return this.point.properties["woe-label"].split(",")[0];
            },
          },

          name: series[seriesIndex].replace("_", " "),
          data: prevState.latest.data.map((d) => [
            d.Country_code.toLowerCase(),
            d[series[seriesIndex]],
          ]),
        },
      },
    }));
  };

  updateCaseGraph = (total) => {
    this.setState((prevState) => ({
      caseChartOptions: {
        ...prevState.caseChartOptions,
        chart: {
          height: 250,
          type: !total ? "column" : "",
        },
        series: !total ? prevState.newCaseSeries : prevState.cumCaseSeries,
      },
    }));
  };
  updateDeathGraph = (total) => {
    this.setState((prevState) => ({
      deathChartOptions: {
        ...prevState.deathChartOptions,
        chart: {
          height: 250,
          type: !total ? "column" : "",
        },
        series: !total ? prevState.newDeathSeries : prevState.cumDeathSeries,
      },
    }));
  };

  updateSeries = async (country) => {
    var data = await this.getData(country);
    this.updateMapData(data);
    this.updateChart(data);
  };

  render() {
    const { caseChartOptions, deathChartOptions } = this.state;
    return (
      <div className="body-container">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h3>Global {this.state.search ? " > " + this.state.search : ""}</h3>
          <Autocomplete
            id="size-small-standard"
            size="small"
            options={this.state.countryList}
            style={{ width: 300 }}
            autoHighlight
            value={this.state.search}
            onChange={(e, value, reason) => {
              this.setState({ search: value });
              this.updateSeries(value ? value : "Global");
            }}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" />
            )}
          />
        </div>
        <div className="map-container">
          <SeriesPill
            toggleName={["Cases", "Deaths"]}
            onNew={(e) => this.updateMap(0)}
            onCum={(e) => this.updateMap(1)}
          />
          <MapChart options={this.state.mapOptions} />
        </div>

        <div style={{ position: "relative" }}>
          <SeriesPill
            toggleName={["New", "Total"]}
            onNew={(e) => this.updateCaseGraph(false)}
            onCum={(e) => this.updateCaseGraph(true)}
          />
          <div style={{ position: "absolute", padding: "30px", zIndex: "1" }}>
            <h1 style={{ margin: 0 }}>
              {this.state.latest.cumulativeCases ||
              this.state.latest.cumulativeDeaths === 0
                ? formatNumber(this.state.latest.cumulativeCases)
                : null}
            </h1>
            <h3 style={{ margin: 0 }}>Confirmed Cases</h3>
          </div>
          <HighchartsReact id="new-case" config={caseChartOptions} />
        </div>

        <div style={{ position: "relative" }}>
          <SeriesPill
            toggleName={["New", "Total"]}
            onNew={(e) => this.updateDeathGraph(false)}
            onCum={(e) => this.updateDeathGraph(true)}
          />
          <div style={{ position: "absolute", padding: "30px", zIndex: "1" }}>
            <h1 style={{ margin: 0 }}>
              {this.state.latest.cumulativeDeaths ||
              this.state.latest.cumulativeDeaths === 0
                ? formatNumber(this.state.latest.cumulativeDeaths)
                : null}
            </h1>
            <h3 style={{ margin: 0 }}>Deaths</h3>
          </div>
          <HighchartsReact id="new-death" config={deathChartOptions} />
        </div>
      </div>
    );
  }
}

export default Graph;
