import React from "react";
import StandingsHistory from "./components/StandingsHistory";
import Home from "./components/Home";
import Matchups from "./components/Matchups";
import NavBar from "./components/NavBar/NavBar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/StandingsHistory" element={<StandingsHistory />} />
          <Route path="/Matchups" element={<Matchups />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
