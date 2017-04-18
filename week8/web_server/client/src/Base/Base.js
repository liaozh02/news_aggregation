import React from 'react';
import Header from "../Header/Header";
import LoginPage from "../Login/LoginPage";
import SignupPage from "../Signup/SignupPage";
//import { Link } from "react-router";
import "./Base.css";

class Base extends React.Component {
  componentDidMount() {
    window.$(document).ready(function(){
      window.$('ul.tabs').tabs();
    });
  }


  render() {
    return(
      <div>
        <div className="row">
          <Header />
        </div>
        <div className="row">
        <div className='container logform'>
          <ul className="tabs">
            <li className="tab col s6"><a className="active blue-text text-lighten-2" href="#signup">Sign Up</a></li>
            <li className="tab col s6"><a className="blue-text text-lighten-2" href="#login">Log In</a></li>
          </ul>
        </div>
        </div>
        <div id="signup">
          <SignupPage id="signup"/>
        </div>
        <div id="login">
          <LoginPage id="login"/>
        </div>
      </div>
    )
  }
}


export default Base