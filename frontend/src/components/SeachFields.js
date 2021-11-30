import React from "react";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

class SearchFields extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmitButton = this.handleSubmitButton.bind(this);

    this.state = {
      leagueID: "",
      year: "",
    };
  }

  handleSubmitButton() {
    // Submit the value to the parent component
    this.props.handleSubmitButton(this.state.leagueID, this.state.year);
  }

  handleLeagueIDChange = (event) => {
    this.setState({ leagueID: event.target.value });
  };
  handleYearChange = (event) => {
    this.setState({ year: event.target.value });
  };

  render() {
    return (
      <Box
        component="form"
        sx={{
          "& > :not(style)": { mt: 3, ml: 1 },
        }}
        noValidate
        autoComplete="off"
      >
        <TextField
          id="league-id-input-id"
          label="League ID"
          value={this.state.leagueID}
          onChange={this.handleLeagueIDChange}
        />

        <TextField
          id="year-input-id"
          label="Year"
          value={this.state.year}
          onChange={this.handleYearChange}
        />
        <Button
          onClick={() => {
            this.handleSubmitButton();
          }}
          variant="contained"
        >
          Search
        </Button>
      </Box>
    );
  }
}

export default SearchFields;
