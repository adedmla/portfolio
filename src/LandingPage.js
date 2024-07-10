import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

const LandingPage = ({ show }) => {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setOpacity(1), 100);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <div
      className={`inner-container landing-page ${show ? "fade-in" : ""}`}
      style={{ opacity }}
    >
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
      <h1>Adedamola Adejumobi</h1>
      <div className="hero"></div>
      <nav>
        <Link to="/projects">
          <p className="reroute">Projects</p>
        </Link>
        <Link to="/info">
          <p className="reroute">Info</p>
        </Link>
        <Link to="/contact">
          <p className="reroute">Contact</p>
        </Link>
      </nav>
      <p className="excerpt1">
        Hey! My name is Adedamola Adejumobi. I am a CS student at Northwestern
        University and I'm interested in software engineering, data analysis,
        and various other tech related fields. This website is constantly
        updating. Welcome!
      </p>
    </div>
  );
};

export default LandingPage;
