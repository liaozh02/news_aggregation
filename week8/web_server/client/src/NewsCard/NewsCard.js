import './NewsCard.css';
import React from 'react'
import Auth from '../Auth/Auth'

const config = require('../../../../config/config.json');
class NewsCard extends React.Component{
    redirectToUrl(event, url) {
        event.preventDefault();
        this.sendClickLog();
        window.open(url, '_blank');
    }

    sendClickLog() {
 //       let url = 'http://localhost:3000/news/userId/' + Auth.getEmail()
 //           + '/newsId/' + this.props.news.digest;
        const domain = config.webServer.domain;
        const port = config.webServer.port;
        let url = "http://" + domain + ":" + port + "/news/userId/" + Auth.getEmail()
            + '/newsId/' + encodeURIComponent(this.props.news.digest);
        let request = new Request(url, {
            method: 'POST',
            cache: false,
            headers: {
                'Authorization': 'bearer ' + Auth.getToken(),
            }
        });
        fetch(request);
    }
    
    render(){
        return(
             <div className="news-container" onClick={(event) => this.redirectToUrl(event, this.props.news.url)}>
                <div className='row'>
                <div className='col s4 fill'>
                    <img src={this.props.news.urlToImage} alt='news'/>
                </div>
                <div className="col s8">
                    <div className="news-intro-col">
                        <div className="news-intro-panel">
                            <h5>{this.props.news.title}</h5>
                            <div className="news-description">
                               <p>{this.props.news.description}</p>
                            </div>
                        </div>
                        <div className="news-chip-list">
                            {this.props.news.source != null && <div className='chip light-blue news-chip'>{this.props.news.source}</div>}
                            {this.props.news.reason != null && <div className='chip light-green news-chip'>{this.props.news.reason}</div>}
                            {this.props.news.time != null && <div className='chip amber news-chip'>{this.props.news.time}</div>}
                            {this.props.news.class != null && <div className='chip teal lighten-2 news-chip'>{this.props.news.class}</div>}      
                        </div>
                    </div>
                </div>
                </div>
            </div>
        );
    }


}


export default NewsCard;