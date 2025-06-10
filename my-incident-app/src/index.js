// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css';


// CSS (можно добавить позже, если понадобится)
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
