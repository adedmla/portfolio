import React from "react";
import { Link } from "react-router-dom";
import "./App.css";

const Info = () => {
  return (
    <div>
      <h1>Info</h1>
      <Link to="/landing">
        <p className="reroute">LandingPage</p>
      </Link>

      <div className="info-section">
        <h2 className="proj2">Education</h2>
        <div className="education-entry">
          <p className="education-details">
            <strong>Northwestern University</strong> | B.S. in Computer Science
            | May 2027
          </p>
        </div>
        <div className="education-entry">
          <p className="education-details">
            <strong>Houston Community College</strong> | Associate in Science |
            May 2023
          </p>
        </div>
      </div>

      <div className="info-section">
        <h2 className="proj2">Scholarships and Awards</h2>
        <ul className="scholarships-awards">
          <li className="award-entry">
            QuestBridge Scholarship Match Recipient: Award given to high
            achieving low-income students.
          </li>
          <li className="award-entry">
            Gates Scholar: Highly selective (less than 1%) merit based
            scholarship.
          </li>
          <li className="award-entry">
            IEEE Technical Program User Design Award: Award given to app that
            exhibits exceptional design skills.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Info;
