import React from "react";
import { Nav, NavLink, Bars, NavMenu } from "./NavBarElements";

const Navbar = () => {
  return (
    <>
      <Nav>
        <Bars />

        <NavMenu>
          <NavLink to="/Home">Home</NavLink>
          <NavLink to="/StandingsHistory">Standings</NavLink>
          <NavLink to="/Matchups">Matchups</NavLink>
          {/* Second Nav */}
          {/* <NavBtnLink to='/sign-in'>Sign In</NavBtnLink> */}
        </NavMenu>
      </Nav>
    </>
  );
};

export default Navbar;
