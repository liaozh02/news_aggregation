import React from 'react'
import logo from '../../public/logo.png';
import './Header.css'

class Header extends React.Component {
    render() {
        return(
        <div>
            <img className="logo" src={logo} alt="logo" />
            <h5 className="center-align blue-text text-lighten-2">Discover The World Around You!</h5>
        </div>
        )
    }
}

export default Header;