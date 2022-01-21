import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
class WeeklyAwardCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        awardName: this.props.awardName,
        teamNames: this.props.teamNames,
        points: this.props.points
    }
    
  }

  

  render() {
    return (
        <Card key={this.props.bar} sx={{ maxWidth: 345, maxHeight: 220 }}>
            <CardContent sx={{ maxWidth: 345, minHeight: 220 }}>
                <Typography gutterBottom variant="h5" component="div">
                {this.props.awardName}
                </Typography>
                <Typography gutterBottom variant="h4" component="div">
                {this.props.teamNames}
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
                {this.props.points}
                </Typography>
            </CardContent>
        </Card>
    );
  }
}

export default WeeklyAwardCard;
