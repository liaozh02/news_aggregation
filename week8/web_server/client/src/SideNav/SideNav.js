import React, { Component } from 'react';
import logo from '../../public/alice.jpg';
import Auth from '../Auth/Auth';
import './SideNav.css';


class SideNav extends Component {
  constructor(props) {
    super(props);
  //  this.onClickLinks = this.props.changeTopic.bind(this);
    this.onClickLinks = (event,topic) =>{
      console.log('click on ' + topic);
      this.props.changeTopic(topic);
    }
  }

  render() {
    window.$(".button-collapse").sideNav();
    window.$('.collapsible').collapsible();
    return (
      <div>
        <ul id="slide-out" className="side-nav">
          <li><div className="userView">
            <a href="#!"><img className="circle" src={logo} alt="User"/></a>
            <p>{Auth.getName()}</p>
            <p>{Auth.getEmail()}</p>
          </div></li>
          <li><a href="#!" onClick={(event) =>this.onClickLinks(event,'')}>All News</a></li>
          <li><div className="divider"></div></li>
          <li><a className="subheader">Catogory</a></li>
          <li><a href="#!" onClick={(event) =>this.onClickLinks(event,'World')}>World</a></li>
          <li><a href="#!" onClick={(event) =>this.onClickLinks(event,'U.S.')}>U.S.</a></li>
          <li><a href="#!" onClick={(event) =>this.onClickLinks(event,'Business & Economic')}>Business Economic</a></li>
          <li><a href="#!" onClick={(event) =>this.onClickLinks(event,'Technology')}>Technology</a></li>
          <li><a href="#!" onClick={(event) =>this.onClickLinks(event,'Entertainment')}>Entertainment</a></li>
          <li><a href="#!" onClick={(event) =>this.onClickLinks(event,'Sports')}>Sports</a></li>
          <li><a href="#!" onClick={(event) =>this.onClickLinks(event,'Science & Environment')}>Science Environment</a></li>
          <li><a href="#!" onClick={(event) =>this.onClickLinks(event,'Health & Life')}>Health Life</a></li>
        </ul>
        <a href="#" data-activates="slide-out" className="button-collapse"><i className="material-icons">menu</i></a>
      </div>
    )
  }
}

export default SideNav;