import React from 'react'
import logo from '../../public/logo_small.png';
import Auth from '../Auth/Auth';
import { Link } from 'react-router';
//import $ from 'jquery'
import './Newsheader.css'

class Newsheader extends React.Component {
    
    render() {
        window.$('dropdown-button').dropdown();
        return(
        <div>
            <nav>
                <div className="nav-wrapper blue lighten-2">
                <img className="logo-news left" src={logo} alt="logo" />
                <ul id="nav-mobile" className="right hide-on-med-and-down">
                    <li><a className='darken-1' href='#'>{Auth.getName()}</a></li> 
                    <li><Link to="/logout"><i className='material-icons right'>exit_to_app</i></Link></li>
                </ul>
                </div>
            </nav>
        </div>
        )
    }
}

export default Newsheader;