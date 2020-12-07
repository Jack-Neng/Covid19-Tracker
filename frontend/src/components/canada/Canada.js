import React, { Component } from "react";
import {
  Form,
  FormControl,
  ToggleButton,
  ToggleButtonGroup,
} from "react-bootstrap";
import mapData from "../../api/canadaMapData.js";
import MapChart from "../highcharts/Map";
import HighchartsReact from "react-highcharts";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import { API_BASE_URL } from "../../constants";

import Axios from "axios";

const provinceMapping = {
  "British Columbia": "ca-bc",
  Nunavut: "ca-nu",
  "Northwest Territories": "ca-nt",
  Alberta: "ca-ab",
  "Newfoundland and Labrador": "ca-nl",
  Saskatchewan: "ca-sk",
  Manitoba: "ca-mb",
  Quebec: "ca-qc",
  Ontario: "ca-on",
  "New Brunswick": "ca-nb",
  "Nova Scotia": "ca-ns",
  "Prince Edward Island": "ca-pe",
  Yukon: "ca-yt",
};

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

class Canada extends Component {
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
        series: [],
      },
      caseChartOptions: {
        chart: {
          height: 250,
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
      seriesData: [],
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
    const res = await Axios.get(`${API_BASE_URL}/ca`, {
      params: { country },
    });
    return res.data;
  };

  async componentDidMount() {
    var data = await this.getData("Canada");
    this.updateMapData(data);
    this.updateChart(data);
  }

  updateMapData = (data) => {
    var lastestDate = data[data.length - 1].date;
    var latest = data.filter((d) => d.date === lastestDate);
    this.setState({ latest });
    this.updateMap(0);
  };

  updateMap = (seriesIndex) => {
    var series = ["numtotal", "numdeaths", "numtoday", "numdeathstoday"];

    this.setState((prevState) => ({
      mapOptions: {
        ...prevState.mapOptions,
        colorAxis: {
          min: 0,
          stops: [
            [0, seriesIndex === 0 ? "#95DCF4" : "#FFEDC1"],
            [0.2, seriesIndex === 0 ? "#00ACE3" : "#D86422"],
            [1, seriesIndex === 0 ? "#007092" : "#994414"],
          ],
        },
        series: {
          mapData: mapData,
          dataLabels: {
            enabled: true,
            color: "#333333",
            format: "{point.value}",
          },

          name: series[seriesIndex],
          data: prevState.latest.map((d) => [
            provinceMapping[d.prname],
            d[series[seriesIndex]],
          ]),
        },
      },
    }));
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
    var province = [...new Set(["Canada"].concat(data.map((d) => d.prname)))];
    var series = [];
    province.forEach((p) => {
      var prdata = [];
      data.forEach((d) => {
        if (d.prname === p) {
          prdata.push(d);
        }
      });
      series.push({ name: p, data: prdata });
    });
    var cumCaseSeries = series.map((d) => ({
      name: d.name,
      data: d.data
        .map((p) => [getUTC(p.date), p.numtotal])
        .sort((a, b) => getUTC(a.date) - getUTC(b.date)),
      visible: d.name === "Canada",
    }));
    var cumDeathSeries = series.map((d) => ({
      name: d.name,
      data: d.data.map((p) => [getUTC(p.date), p.numdeaths]),
      visible: d.name === "Canada",
    }));
    var newCaseSeries = series.map((d) => ({
      name: d.name,
      data: d.data.map((p) => [getUTC(p.date), p.numtoday]),
      visible: d.name === "Canada",
    }));
    var newDeathSeries = series.map((d) => ({
      name: d.name,
      data: d.data.map((p) => [getUTC(p.date), p.numdeathstoday]),
      visible: d.name === "Canada",
    }));
    this.setState({
      cumCaseSeries,
      cumDeathSeries,
      newCaseSeries,
      newDeathSeries,
    });
    this.updateCaseGraph(false);
    this.updateDeathGraph(false);
  };
  updateCaseGraph = (total) => {
    this.setState((prevState) => ({
      caseChartOptions: {
        ...prevState.caseChartOptions,
        series: !total ? prevState.newCaseSeries : prevState.cumCaseSeries,
      },
    }));
  };
  updateDeathGraph = (total) => {
    this.setState((prevState) => ({
      deathChartOptions: {
        ...prevState.deathChartOptions,
        series: !total ? prevState.newDeathSeries : prevState.cumDeathSeries,
      },
    }));
  };

  render() {
    return (
      <div>
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
            <h3 style={{ margin: 0 }}>Confirmed Cases</h3>
          </div>
          <HighchartsReact id="case" config={this.state.caseChartOptions} />
        </div>
        <div style={{ position: "relative" }}>
          <SeriesPill
            toggleName={["New", "Total"]}
            onNew={(e) => this.updateDeathGraph(false)}
            onCum={(e) => this.updateDeathGraph(true)}
          />
          <div style={{ position: "absolute", padding: "30px", zIndex: "1" }}>
            <h3 style={{ margin: 0 }}>Confirmed Deaths</h3>
          </div>
          <HighchartsReact id="death" config={this.state.deathChartOptions} />
        </div>
      </div>
    );
  }
}

export default Canada;
