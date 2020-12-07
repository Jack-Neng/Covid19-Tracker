import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Header from "./components/header/Header";
import Global from "./components/global/Global";
import Canada from "./components/canada/Canada";
import "./App.css";

const App = () => (
  <Router>
    <Header />
    <Route path="/" exact component={Canada} />
    <Route path="/canada" exact component={Canada} />
    <Route path="/global" exact component={Global} />
  </Router>
);

export default App;
