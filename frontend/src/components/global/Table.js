import React, { Component } from "react";
import { Form, FormControl, Button } from "react-bootstrap";

import DataTable from "react-data-table-component";
import Axios from "axios";

import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import { API_BASE_URL } from "../../constants";

import "./Table.css";

const columns = [
  {
    name: "Country",
    selector: "country",
    sortable: true,
  },
  {
    name: "Cumulative Cases",
    selector: "cumCase",
    sortable: true,
  },
  {
    name: "Cumulative Deaths",
    selector: "cumDeath",
    sortable: true,
  },
  {
    name: "New Cases",
    selector: "newCase",
    sortable: true,
  },
  {
    name: "New Deaths",
    selector: "newDeath",
    sortable: true,
  },
];

const conditionalRowStyles = [
  {
    when: (row) => row.country === "Global",
    style: {
      position: "absolute",
      top: "56px",
      // backgroundColor: "rgba(63, 195, 128, 0.9)",
      // color: "white",
      // "&:hover": {
      //   cursor: "pointer",
      // },
    },
  },
];

class Table extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      pending: true,
      filterText: "",
      countryList: [],
    };
  }

  getCases = async (country) => {
    const res = await Axios.get(`${API_BASE_URL}/who`, {
      params: { country },
    });
    this.setupCountryList(res.data);
    var lastest = res.data[res.data.length - 1];
    var total = {
      id: 1,
      country: "Global",
      cumCase: lastest.cumulativeCases,
      cumDeath: lastest.cumulativeDeaths,
      newCase: lastest.newCases,
      newDeath: lastest.newDeaths,
    };
    var data = lastest.data.map((d) => {
      return {
        id: d._id,
        country: d.Country,
        cumCase: d.Cumulative_cases,
        cumDeath: d.Cumulative_deaths,
        newCase: d.New_cases,
        newDeath: d.New_deaths,
      };
    });
    data = data.concat(total);

    this.setState({
      data: data,
      pending: false,
    });
  };

  setupCountryList = (data) => {
    var countryList = data[0].data.map((d) => d.Country);
    this.setState({
      countryList: countryList,
    });
  };

  componentDidMount() {
    this.getCases("Global");
  }

  handleClear = () => {
    if (this.state.filterText) {
      // setResetPaginationToggle(!resetPaginationToggle);
      this.setFilterText("");
    }
  };

  setFilterText = (text) => {
    this.setState({
      filterText: text,
    });
  };

  render() {
    const data = this.state.data;
    return (
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", right: "0", zIndex: "1" }}>
          <Autocomplete
            id="size-small-standard"
            size="small"
            options={this.state.countryList}
            style={{ width: 300 }}
            value={this.state.filterText}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                onChange={(e) =>
                  this.setFilterText(e.target.value.toLowerCase())
                }
              />
            )}
          />
        </div>

        <div>
          <DataTable
            title={
              this.state.filterText !== ""
                ? "Global > '" + this.state.filterText + "'"
                : "Global"
            }
            columns={columns}
            data={data.filter((d) =>
              d.country.toLowerCase().includes(this.state.filterText)
            )}
            defaultSortField="cumCase"
            defaultSortAsc={false}
            progressPending={this.state.pending}
            fixedHeader
            fixedHeaderScrollHeight="550px"
            persistTableHead
            conditionalRowStyles={conditionalRowStyles}
          />
        </div>
      </div>
    );
  }
}

export default Table;
