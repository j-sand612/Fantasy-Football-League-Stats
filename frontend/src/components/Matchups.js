import React from "react";
import axios from "axios";
import SearchFields from "./SeachFields";
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
    };
  }

  handleSubmit = (leagueID, year) => {
    console.log(leagueID);
    console.log(year);
    this.setState({ loading: true });
    let muAPIString =
      "https://ff-league-data.herokuapp.com/Matchup/all?leagueID=" +
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
          maxTeam = matchups[i].Team1Name;
        }
        if (matchups[i].Score2 > maxScore) {
          maxScore = matchups[i].Score2;
          maxTeam = matchups[i].Team2Name;
        }

        if (matchups[i].Score1 < minScore) {
          minScore = matchups[i].Score1;
          minTeam = matchups[i].Team1Name;
        }
        if (matchups[i].Score2 < minScore) {
          minScore = matchups[i].Score2;
          minTeam = matchups[i].Team2Name;
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
            matchups[i].Team1Name + "\n vs \n" + matchups[i].Team2Name;
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
            matchups[i].Team1Name + "\n vs \n" + matchups[i].Team2Name;
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
            matchups[i].Team1Name + "\n vs \n" + matchups[i].Team2Name;
        }
        if (matchups[i].Score1 + matchups[i].Score2 < minScoreTotal) {
          minScoreTotal = matchups[i].Score1 + matchups[i].Score2;
          minScoreTotalString = matchups[i].Score1 + " - " + matchups[i].Score2;

          minScoreTotalTeams =
            matchups[i].Team1Name + "\n vs \n" + matchups[i].Team2Name;
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
            lowestWinTeam = matchups[i].Team1Name;
          }

          if (matchups[i].Score2 > highestLossPoints) {
            highestLossPoints = matchups[i].Score2;
            highestLossTeam = matchups[i].Team2Name;
          }
        }
        if (matchups[i].Score2 > matchups[i].Score1) {
          if (matchups[i].Score2 < lowestWinPoints) {
            lowestWinPoints = matchups[i].Score2;
            lowestWinTeam = matchups[i].Team2Name;
          }

          if (matchups[i].Score1 > highestLossPoints) {
            highestLossPoints = matchups[i].Score1;
            highestLossTeam = matchups[i].Team1Name;
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
                            {m.Team1Name}&nbsp;vs.&nbsp;{m.Team2Name}
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
                      <Card sx={{ maxWidth: 345, maxHeight: 220 }}>
                        <CardContent sx={{ maxWidth: 345, minHeight: 220 }}>
                          <Typography gutterBottom variant="h5" component="div">
                            Highest Scoring Team
                          </Typography>
                          <Typography gutterBottom variant="h4" component="div">
                            {this.state.maxTeam}
                          </Typography>
                          <Typography
                            sx={{
                              display: "flex",
                              justiyContent: "space-between",
                              flexDirection: "column",
                            }}
                            variant="body2"
                            color="text.secondary"
                          >
                            {this.state.maxScore} Points
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={1}>
                      <Card sx={{ maxWidth: 345, maxHeight: 220 }}>
                        <CardContent sx={{ maxWidth: 345, minHeight: 220 }}>
                          <Typography gutterBottom variant="h5" component="div">
                            Lowest Scoring Team
                          </Typography>
                          <Typography gutterBottom variant="h4" component="div">
                            {this.state.minTeam}
                          </Typography>

                          <Typography
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              flexDirection: "column",
                            }}
                            variant="body2"
                            color="text.secondary"
                          >
                            {this.state.minScore} Points
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={1}>
                      <Card sx={{ maxWidth: 345, maxHeight: 220 }}>
                        <CardContent sx={{ maxWidth: 345, minHeight: 220 }}>
                          <Typography gutterBottom variant="h5" component="div">
                            Biggest Blowout
                          </Typography>
                          <Typography gutterBottom variant="h4" component="div">
                            {this.state.maxScoreDifferenceTeams}
                          </Typography>

                          <Typography
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              flexDirection: "column",
                            }}
                            variant="body2"
                            color="text.secondary"
                          >
                            {this.state.maxScoreDifferenceString}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={1}>
                      <Card sx={{ maxWidth: 345, maxHeight: 220 }}>
                        <CardContent sx={{ maxWidth: 345, minHeight: 220 }}>
                          <Typography gutterBottom variant="h5" component="div">
                            Closest Matchup
                          </Typography>
                          <Typography gutterBottom variant="h4" component="div">
                            {this.state.minScoreDifferenceTeams}
                          </Typography>

                          <Typography
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              flexDirection: "column",
                            }}
                            variant="body2"
                            color="text.secondary"
                          >
                            {this.state.minScoreDifferenceString}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={1}>
                      <Card sx={{ maxWidth: 345, maxHeight: 220 }}>
                        <CardContent sx={{ maxWidth: 345, minHeight: 220 }}>
                          <Typography gutterBottom variant="h5" component="div">
                            Highest Scoring Game
                          </Typography>
                          <Typography gutterBottom variant="h4" component="div">
                            {this.state.maxScoreTotalTeams}
                          </Typography>

                          <Typography
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              flexDirection: "column",
                            }}
                            variant="body2"
                            color="text.secondary"
                          >
                            {this.state.maxScoreTotalString}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={1}>
                      <Card sx={{ maxWidth: 345, maxHeight: 220 }}>
                        <CardContent sx={{ maxWidth: 345, minHeight: 220 }}>
                          <Typography gutterBottom variant="h5" component="div">
                            Lowest Scoring Game
                          </Typography>
                          <Typography gutterBottom variant="h4" component="div">
                            {this.state.minScoreTotalTeams}
                          </Typography>

                          <Typography
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              flexDirection: "column",
                            }}
                            variant="body2"
                            color="text.secondary"
                          >
                            {this.state.minScoreTotalString}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={1}>
                      <Card sx={{ maxWidth: 345, maxHeight: 220 }}>
                        <CardContent sx={{ maxWidth: 345, minHeight: 220 }}>
                          <Typography gutterBottom variant="h5" component="div">
                            Highest Points in Loss
                          </Typography>
                          <Typography gutterBottom variant="h4" component="div">
                            {this.state.highestLossTeam}
                          </Typography>

                          <Typography
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              flexDirection: "column",
                            }}
                            variant="body2"
                            color="text.secondary"
                          >
                            {this.state.highestLossPoints}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={1}>
                      <Card sx={{ maxWidth: 345, maxHeight: 220 }}>
                        <CardContent sx={{ maxWidth: 345, minHeight: 220 }}>
                          <Typography gutterBottom variant="h5" component="div">
                            Lowest Points in Win
                          </Typography>
                          <Typography gutterBottom variant="h4" component="div">
                            {this.state.lowestWinTeam}
                          </Typography>

                          <Typography
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              flexDirection: "column",
                            }}
                            variant="body2"
                            color="text.secondary"
                          >
                            {this.state.lowestWinPoints}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </div>
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

export default Matchups;
