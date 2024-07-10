import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Greeting.css";

const Greeting = () => {
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    const navigateTimer = setTimeout(() => {
      navigate("/landing");
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  return (
    <div className={`greeting-container ${fadeOut ? "fade-out" : ""}`}>
      <h1 className="text">Adedamola's Portfolio</h1>
    </div>
  );
};

export default Greeting;
