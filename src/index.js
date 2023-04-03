import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthContextProvider } from "./contexts/AuthContext/AuthContext";
import {Web3ContextProvider} from "./contexts/Web3AccountContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthContextProvider>
      <Web3ContextProvider>
            <App />
        </Web3ContextProvider>
  </AuthContextProvider>
);
