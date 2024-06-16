import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import catnip from "./image0.png";

import "./App.css";

function App() {
  return (
    <div>
      <h1>Hey! My name is Ade.</h1>
      <div className="TypeWriter">
        <p className="description">
          I'm an aspiring software engineer and CS student at Northwestern
          University. This site is a work in progress and constantly updating.
          Welcome!{" "}
        </p>
      </div>
      {/*
        This seperates the introduction of the website to the 
        illustration and descriptions of the project
      */}
      <a href="https://www.linkedin.com/in/adedamola-adejumobi-358492213/">
        <FontAwesomeIcon icon={faLinkedin} className="img_icons" />
      </a>

      <a href="https://github.com/adedmla">
        <FontAwesomeIcon icon={faGithub} className="img_icons" />
      </a>
      <div>
        {/*
        This division closes the introduction and the icons for the website. 
      */}
        <div>
          <h3>TripPlanner</h3>
          <p className="language">Data Structure Student Langugage</p>
          <p className="project_description">
            This project implements a trip planning API that handles queries
            such as locating all points of interests by category, planning
            routes between POI, and finding nearby POIs within a specific
            category and upward limit. The road network is represented with a
            WUGraph: the vertices are the POI and the edges are the distance
            between them. Djikstra’s algorithm implemented with a binary heap is
            used to find the shortest path. Decisions for the ADT’s, specific
            implementation, and algorithms are highlighted in an entity
            relationship diagram and an analysis of alternatives concerning the
            choices.{" "}
          </p>
        </div>

        <img
          className="img_deg"
          src={catnip}
          alt="catnip.nu logo"
          style={{ width: "20%", height: "auto" }}
        />

        <h3>Catnip.nu</h3>
        <p className="language">Html, CSS, Javascript </p>
        <p className="project_description">
          Catnip.nu is a web application that connects students around
          Northwestern University to various programs and clubs in the
          community. Featuring an interactive map implemented with Leaflet API
          it enables users to create share new events on campus by dragging the
          pin to a designated location. Firebase API is leveraged for user-sign
          in options such as Google. Additionally, there are filters for looking
          for events on campus such as religious gathering, events that have
          free food,performance, etc. Catnip.nu provides a central hub where
          Wildcats can discover events, join student organizations, and
          celebrate our diverse interests and backgrounds.{" "}
        </p>
      </div>
    </div>
  );
}

export default App;
