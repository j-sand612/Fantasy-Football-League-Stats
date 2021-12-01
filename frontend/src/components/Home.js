import React from "react";

const Home = () => {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "Center",
        }}
      >
        <h1>Fantasy Football League Data</h1>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "Center",
        }}
      >
        <p>
          This site site is for visualizing data throughout your current and
          past ESPN Fantasy Football Leagues, and it is only compatible with
          public ESPN Leagues
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "Center",
        }}
      >
        <p>Navigate through the different features using the tabs at the top</p>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "Center",
        }}
      >
        <p>
          You will need the your league id which you can find in the espn url
          once you navigate to your league home page
        </p>
      </div>
    </>
  );
};

export default Home;
