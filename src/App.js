import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { HelmetProvider, Helmet } from "react-helmet-async";
import "./App.css";

import LandingPage from "./LandingPage";
import Projects from "./Projects";
import Info from "./Info";
import Contact from "./Contact";
import Greeting from "./Greeting";

const App = () => {
  const [showGreeting, setShowGreeting] = useState(true);
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreeting(false);
      setShowLanding(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <HelmetProvider>
      <Helmet>
        <title>Adedamola's Portfolio</title>
      </Helmet>
      <Router>
        <Routes>
          <Route path="/projects" element={<Projects />} />
          <Route path="/info" element={<Info />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/"
            element={
              <>
                {showGreeting && <Greeting />}
                {showLanding ? <LandingPage show={showLanding} /> : null}
              </>
            }
          />
          <Route path="/landing" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
};

export default App;
