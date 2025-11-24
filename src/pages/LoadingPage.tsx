import React from "react";
import logo from "../assets/logo.png";
import "./LoadingPage.css";

const LoadingPage: React.FC = () => {
  return (
    <div className="loading-page-container">
      <div className="loading-content">
        <img src={logo} alt="Loading..." className="loading-logo" />
      </div>
    </div>
  );
};

export default LoadingPage;
