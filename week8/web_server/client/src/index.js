import React from 'react';
import ReactDOM from 'react-dom';
import { Router, browserHistory} from 'react-router';
import routes from './routes';
import 'materialize-css/dist/css/materialize.css';
import 'materialize-css/dist/js/materialize.js';
import './index.css';


ReactDOM.render(
  <Router history={browserHistory} routes={routes} />,
  document.getElementById('root')
);
