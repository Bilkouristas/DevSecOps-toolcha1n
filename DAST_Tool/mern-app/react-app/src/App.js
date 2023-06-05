import React from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import FormPage from "./components/formPage";
import ReportsPage from "./components/reportsPage";
import Report from "./components/report";
import Alert from "./components/alert";
import NotFound from "./components/notFound";
import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import "font-awesome/css/font-awesome.css";
import NavBar from "./components/navBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <div className="App">
      <ToastContainer />
      <NavBar />

      <Switch>
        <Route exact path="/" component={FormPage} />
        <Route exact path="/reports" component={ReportsPage} />
        <Route path="/reports/:id/:name/:risk" component={Alert} />
        <Route path="/reports/:id" component={Report} />
        <Route path="/not-found" component={NotFound} />
        <Redirect to="/not-found" />
      </Switch>
    </div>
  );
};

export default App;
