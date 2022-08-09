import * as React from "react";
import "./spinner.css";

export default function LoadingSpinner() {
  return (
    <center>
      <div className="spinner-container">
        <div className="loading-spinner"></div>
        <h3>Waving in Progress, the transaction is being confirmed !</h3>
      </div>
    </center>
  );
}
