import React from "react";
import axios from "axios";
import SearchFields from "./SeachFields";
import WeeklyAwardCard from "./WeeklyAwardCard/WeeklyAwardCard";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

import Grid from "@mui/material/Grid";

import appConfig from "../config/config";
import Alert from "@mui/material/Alert";

class Matchups extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      matchups: 0,
      matchupsResponse: 0,
      weeks: 0,
      week: 0,
      maxScore: 0,
      minScore: 9999,
      maxTeam: "",
      minTeam: "",
      maxScoreDifferenceString: "",
      maxScoreDifferenceTeams: "",
      minScoreDifferenceString: "",
      minScoreDifferenceTeams: "",
      maxScoreTotalString: "",
      maxScoreTotalTeams: "",
      minScoreTotalString: "",
      minScoreTotalTeams: "",
      highestLossPoints: "",
      highestLossTeam: "",
      lowestWinPoints: "",
      lowestWinTeam: "",
      error: false,
    };
  }

  handleSubmit = (leagueID, year) => {
    this.setState({ loading: true, error: false });
    let muAPIString =
      appConfig.apiURL +
      appConfig.matchupPath +
      "?leagueID=" +
      leagueID +
      "&year=" +
      year;
    axios
      .get(muAPIString)
      .then((matchupsResponse) => {
        if (matchupsResponse.status === 200) {
          this.setState({ loading: false });
        }
        let matchups = matchupsResponse.data;
        let weeks = [];
        let week = 0;
        let i;
        for (i = 0; i < matchups.length; i++) {
          if (
            matchups[i].Score1 !== 0 &&
            matchups[i].Score2 !== 0 &&
            matchups[i].Type === "Regular" &&
            !weeks.includes(matchups[i].Week)
          ) {
            weeks.push(matchups[i].Week);
          }
        }

        week = weeks[weeks.length - 1];
        this.setScoreStates(week, matchups);
        this.setBlowoutCloseWin(week, matchups);
        this.setHLLW(week, matchups);
        this.setHighestLowestScores(week, matchups);
        this.setState({ matchups, matchupsResponse, weeks, week });
      })
      .catch((error) => {
        this.setState({ error: true, loading: false });
        console.log(error);
      });
  };

  componentDidMount() {}

  setScoreStates(week, matchups) {
    let maxScore = 0;
    let maxTeam = "";
    let minScore = 9999;
    let minTeam = "";
    let i = 0;
    for (i = 0; i < matchups.length; i++) {
      if (matchups[i].Week === week) {
        if (matchups[i].Score1 > maxScore) {
          maxScore = matchups[i].Score1;
          maxTeam = this.acr(matchups[i].Team1Name);
        }
        if (matchups[i].Score2 > maxScore) {
          maxScore = matchups[i].Score2;
          maxTeam = this.acr(matchups[i].Team2Name);
        }

        if (matchups[i].Score1 < minScore) {
          minScore = matchups[i].Score1;
          minTeam = this.acr(matchups[i].Team1Name);
        }
        if (matchups[i].Score2 < minScore) {
          minScore = matchups[i].Score2;
          minTeam = this.acr(matchups[i].Team2Name);
        }
      }
    }
    this.setState({
      maxScore,
      maxTeam,
      minScore,
      minTeam,
    });
  }

  acr(str){
    console.log(str)
    let words, acronym, nextWord;

    words = str.split(' ');
    acronym= "";
    let index = 0
    while (index<words.length) {
            nextWord = words[index];
            acronym = acronym + nextWord.charAt(0);
            index = index + 1 ;
    }
    return acronym
  }

  setBlowoutCloseWin(week, matchups) {
    let maxScoreDifference = 0;
    let minScoreDifference = 9999;
    let maxScoreDifferenceTeams = "";
    let minScoreDifferenceTeams = "";
    let maxScoreDifferenceString = "";
    let minScoreDifferenceString = "";
    let i = 0;
    for (i = 0; i < matchups.length; i++) {
      if (matchups[i].Week === week) {
        if (
          Math.abs(matchups[i].Score1 - matchups[i].Score2) > maxScoreDifference
        ) {
          maxScoreDifference = Math.abs(
            matchups[i].Score1 - matchups[i].Score2
          );
          maxScoreDifferenceString =
            matchups[i].Score1 + " - " + matchups[i].Score2;
          maxScoreDifferenceTeams =
            this.acr(matchups[i].Team1Name) + "\n vs \n" + this.acr(matchups[i].Team2Name);
        }
        if (
          Math.abs(matchups[i].Score1 - matchups[i].Score2) < minScoreDifference
        ) {
          minScoreDifference = Math.abs(
            matchups[i].Score1 - matchups[i].Score2
          );
          minScoreDifferenceString =
            matchups[i].Score1 + " - " + matchups[i].Score2;

          minScoreDifferenceTeams =
            this.acr(matchups[i].Team1Name) + "\n vs \n" + this.acr(matchups[i].Team2Name);
        }
      }
    }
    this.setState({
      maxScoreDifferenceString,
      maxScoreDifferenceTeams,
      minScoreDifferenceString,
      minScoreDifferenceTeams,
    });
  }

  setHighestLowestScores(week, matchups) {
    let maxScoreTotal = 0;
    let minScoreTotal = 9999;
    let maxScoreTotalTeams = "";
    let minScoreTotalTeams = "";
    let maxScoreTotalString = "";
    let minScoreTotalString = "";
    let i = 0;
    for (i = 0; i < matchups.length; i++) {
      if (matchups[i].Week === week) {
        if (matchups[i].Score1 + matchups[i].Score2 > maxScoreTotal) {
          maxScoreTotal = matchups[i].Score1 + matchups[i].Score2;
          maxScoreTotalString = matchups[i].Score1 + " - " + matchups[i].Score2;
          maxScoreTotalTeams =
            this.acr(matchups[i].Team1Name) + "\n vs \n" + this.acr(matchups[i].Team2Name);
        }
        if (matchups[i].Score1 + matchups[i].Score2 < minScoreTotal) {
          minScoreTotal = matchups[i].Score1 + matchups[i].Score2;
          minScoreTotalString = matchups[i].Score1 + " - " + matchups[i].Score2;

          minScoreTotalTeams =
            this.acr(matchups[i].Team1Name) + "\n vs \n" + this.acr(matchups[i].Team2Name);
        }
      }
    }
    this.setState({
      maxScoreTotalString,
      maxScoreTotalTeams,
      minScoreTotalString,
      minScoreTotalTeams,
    });
  }

  //highest loss, lowest win
  setHLLW(week, matchups) {
    let highestLossPoints = 0;
    let lowestWinPoints = 9999;
    let highestLossTeam = "";
    let lowestWinTeam = "";
    let i = 0;
    for (i = 0; i < matchups.length; i++) {
      if (matchups[i].Week === week) {
        if (matchups[i].Score1 > matchups[i].Score2) {
          if (matchups[i].Score1 < lowestWinPoints) {
            lowestWinPoints = matchups[i].Score1;
            lowestWinTeam = this.acr(matchups[i].Team1Name);
          }

          if (matchups[i].Score2 > highestLossPoints) {
            highestLossPoints = matchups[i].Score2;
            highestLossTeam = this.acr(matchups[i].Team2Name);
          }
        }
        if (matchups[i].Score2 > matchups[i].Score1) {
          if (matchups[i].Score2 < lowestWinPoints) {
            lowestWinPoints = matchups[i].Score2;
            lowestWinTeam = this.acr(matchups[i].Team2Name);
          }

          if (matchups[i].Score1 > highestLossPoints) {
            highestLossPoints = matchups[i].Score1;
            highestLossTeam = this.acr(matchups[i].Team1Name);
          }
        }
      }
    }
    this.setState({
      highestLossPoints,
      highestLossTeam,
      lowestWinPoints,
      lowestWinTeam,
    });
  }

  handleChange = (event) => {
    this.setBlowoutCloseWin(event.target.value, this.state.matchups);
    this.setHighestLowestScores(event.target.value, this.state.matchups);
    this.setScoreStates(event.target.value, this.state.matchups);
    this.setHLLW(event.target.value, this.state.matchups);
    this.setState({
      week: event.target.value,
    });
  };

  render() {
    return (
      <div>
        <SearchFields handleSubmitButton={this.handleSubmit}></SearchFields>
        <div>
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


          {this.state.matchupsResponse.status === 200 ? (
            <>
              <Box sx={{ minWidth: 120 }}>
                <FormControl sx={{ m: 1, minWidth: 120 }}>
                  <InputLabel id="week-select-label">Week</InputLabel>
                  <Select
                    labelId="week-select-label"
                    id="week-select"
                    value={this.state.week}
                    label="Week"
                    onChange={this.handleChange}
                  >
                    {this.state.weeks.map((w) => (
                      <MenuItem value={w}>Week {w}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <TableContainer sx={{ maxWidth: 650 }} component={Paper}>
                <Table
                  sx={{ maxWidth: 650 }}
                  size="small"
                  aria-label="Matchups"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Matchup</TableCell>
                      <TableCell align="right">Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.matchups
                      .filter((m) => m.Week === this.state.week)
                      .map((m) => (
                        <TableRow
                          key={m.key}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            {this.acr(m.Team1Name)}&nbsp;vs.&nbsp;{this.acr(m.Team2Name)}
                          </TableCell>
                          <TableCell align="right">
                            {m.Score1}&nbsp;-&nbsp;{m.Score2}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  paddingTop: "50px",
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Grid container spacing={2} columns={4}>
                    <Grid item xs={1}>
                      <WeeklyAwardCard awardName="Highest Scoring Team" teamNames={this.state.maxTeam} points={this.state.maxScore + ' Points'}></WeeklyAwardCard>
                    </Grid>
                    <Grid item xs={1}>
                      <WeeklyAwardCard awardName="Lowest Scoring Team" teamNames={this.state.minTeam} points={this.state.minScore + ' Points'}></WeeklyAwardCard>
                    </Grid>

                    <Grid item xs={1}>
                      <WeeklyAwardCard awardName="Biggest Blowout" teamNames={this.state.maxScoreDifferenceTeams} points={this.state.maxScoreDifferenceString}></WeeklyAwardCard> 
                    </Grid>

                    <Grid item xs={1}>
                      <WeeklyAwardCard awardName="Closest Matchup" teamNames={this.state.minScoreDifferenceTeams} points={this.state.minScoreDifferenceString}></WeeklyAwardCard>
                    </Grid>

                    <Grid item xs={1}>
                      <WeeklyAwardCard awardName="Highest Scoring Game" teamNames={this.state.maxScoreTotalTeams} points={this.state.maxScoreTotalString}></WeeklyAwardCard>
                    </Grid>

                    <Grid item xs={1}>
                      <WeeklyAwardCard awardName="Lowest Scoring Game" teamNames={this.state.minScoreTotalTeams} points={this.state.minScoreTotalString}></WeeklyAwardCard>
                    </Grid>

                    <Grid item xs={1}>
                      <WeeklyAwardCard awardName="Highest Points in Loss" teamNames={this.state.highestLossTeam} points={this.state.highestLossPoints + ' Points'}></WeeklyAwardCard>
                    </Grid>

                    <Grid item xs={1}>
                      <WeeklyAwardCard awardName="Lowest Points in Win" teamNames={this.state.lowestWinTeam} points={this.state.lowestWinPoints + ' Points'}></WeeklyAwardCard>
                    </Grid>
                  </Grid>
                </Box>
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

export default Matchups;
