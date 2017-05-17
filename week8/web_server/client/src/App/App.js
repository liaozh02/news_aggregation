import React, { Component } from 'react';
import Newsheader from "../Header/Newsheader"

import './App.css';

import NewsPanel from "../NewsPanel/NewsPanel"

class App extends Component {
  render() {
    return (
      <div>
        <div className="row">
          <Newsheader />
        </div>
        <div className="row">
            <NewsPanel />
        </div>
      </div>
    );
  }
}

export default App;
