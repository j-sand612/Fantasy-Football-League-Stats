import React from "react";
import SearchFields from "./SeachFields";
import chartLineModel from "../models/chartLineModel";
import lineDataModel from "../models/lineDataModel";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DataGrid } from "@mui/x-data-grid";
import CircularProgress from "@mui/material/CircularProgress";

import axios from "axios";

import appConfig from "../config/config";
import Alert from "@mui/material/Alert";

class StandingsHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      response: 0,
      data: 0,
      teams: 0,
      standings: 0,
      curStandingsResponse: 0,
      loading: false,
      error: false,
    };
  }

  lineColors = [
    "#e6194b",
    "#3cb44b",
    "#ffe119",
    "#4363d8",
    "#f58231",
    "#911eb4",
    "#46f0f0",
    "#f032e6",
    "#bcf60c",
    "#fabebe",
    "#008080",
    "#e6beff",
  ];

  columns = [
    { field: "name", headerName: "Team", width: 260 },
    { field: "Wins", headerName: "Wins", width: 70 },
    { field: "Losses", headerName: "Losses", width: 130 },
    { field: "Points For", headerName: "Points For", width: 130 },
    { field: "Points Against", headerName: "Points Against", width: 130 },
  ];

  handleSubmit = (leagueID, year) => {
    this.setState({ loading: true, error: false });
    let apiString =
      appConfig.apiURL +
      appConfig.standingsPath +
      "?leagueID=" +
      leagueID +
      "&year=" +
      year;
    axios
      .get(apiString)
      .then((response) => {
        console.log("SUCCESS", response);
        let data = response.data;
        let teams = [];
        let i, j;
        let setDashedValue = false;
        for (i = 0; i < data.length; i++) {
          let weekNames = Object.keys(data[i]);
          let standingsData = [];
          let dashData = [];
          for (j = 0; j < weekNames.length; j++) {
            if (weekNames[j] !== "Team") {
              let lineData = new lineDataModel(
                weekNames[j],
                data[i][weekNames[j]]
              );
              if (!setDashedValue) {
                dashData.push(new lineDataModel(weekNames[j], 6));
              }
              standingsData.push(lineData);
            }
          }
          let teamLine = new chartLineModel(
            data[i].Team,
            standingsData,
            this.lineColors[i],
            "1"
          );
          if (!setDashedValue) {
            let cutoffLine = new chartLineModel(
              "Playoff Cutoff",
              dashData,
              "#000000",
              "4 4 4"
            );
            teams.push(cutoffLine);
            setDashedValue = true;
          }
          teams.push(teamLine);
        }
        if (
          this.state.curStandingsResponse.status === 200 &&
          response.status === 200
        ) {
          this.setState({ loading: false });
        }
        this.setState({ response, data, teams });
      })
      .catch((error) => {
        this.setState({ error: true, loading: false });
        console.log(error);
      });

    let apiCurString =
      appConfig.apiURL +
      appConfig.currentStandingsPath +
      "?leagueID=" +
      leagueID +
      "&year=" +
      year;
    axios
      .get(apiCurString)
      .then((curStandingsResponse) => {
        console.log("SUCCESS", curStandingsResponse);
        let standings = curStandingsResponse.data;
        if (
          curStandingsResponse.status === 200 &&
          this.state.response.status === 200
        ) {
          this.setState({ loading: false });
        }
        this.setState({ standings, curStandingsResponse });
      })
      .catch((error) => {
        this.setState({ error: true, loading: false });
        console.log(error);
      });
  };

  componentDidMount() {}

  render() {
    return (
      <div>
        <SearchFields handleSubmitButton={this.handleSubmit}></SearchFields>
        <div>
          {this.state.response.status === 200 ? (
            <>
              <ResponsiveContainer width="99%" aspect={3}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    type="category"
                    allowDuplicatedCategory={false}
                  />
                  <YAxis reversed="true" dataKey="value" />
                  <Tooltip />
                  <Legend />
                  {this.state.teams.map((s) => (
                    <Line
                      dataKey="value"
                      data={s.data}
                      name={s.name}
                      key={s.name}
                      stroke={s.stroke}
                      strokeDashArray={s.strokeDasharray}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </>
          ) : (
            <></>
          )}

          {this.state.curStandingsResponse.status === 200 ? (
            <>
              <div style={{ height: 800, width: "60%" }}>
                <DataGrid
                  rows={this.state.standings}
                  columns={this.columns}
                  rowsPerPageOptions={[]}
                />
              </div>
            </>
          ) : (
            <></>
          )}

          {this.state.error ? (
            <>
              <Alert severity="error">Error retrieving data</Alert>
            </>
          ) : (
            <></>
          )}

          {this.state.loading ? (
            <>
              <div style={{ alignContent: "center" }}>
                <CircularProgress color="success" />
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    );
  }
}

export default StandingsHistory;
