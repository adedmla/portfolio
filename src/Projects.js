import React from "react";
import { Link } from "react-router-dom";
import CatnipLogo from "./image0.png";
const Projects = () => {
  return (
    <div>
      <h1>Projects</h1>
      <Link to="/landing">
        <p className="reroute">LandingPage</p>
      </Link>
      <div className="imageContainer">
        <img src={CatnipLogo} alt="Catnip.nu Logo" className="scaledImage" />
        <div className="proj-container">
          <a>
            <p className="proj">TripPlanner API</p>
          </a>
          <p className="proj_description">
            Python program that implements Dijkstra’s algorithm. Problem was to
            solve complex queries such as locate all positions within a specific
            category, calculate the shortest path from a position, and find the
            (up to) n points-of-interest in the given category nearest the
            starting position.
          </p>
          <a href="https://github.com/ElysiaLopez/catnip.nu/blob/sign_up_page/client/src/components/LoginSignup.css">
            <p className="proj">Catnip.nu</p>
          </a>
          <p className="proj_description">
            Web application aimed towards promoting an engaged community at
            Northwestern University where information about events and
            organizations is easily accessible. Features an intereactive map via
            Leaflet API and FireBase API for google sign-up, sign-in, and user
            authentication.{" "}
          </p>
          <a>
            <p className="proj">Technology Dashboard</p>
          </a>
          <p className="proj_description">
            Real time operational dashboard that Harris County Precinct one
            actively uses to service over 400 public servants. Created using
            PowerBI leveraging data in CRM Microsoft dynamics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Projects;
