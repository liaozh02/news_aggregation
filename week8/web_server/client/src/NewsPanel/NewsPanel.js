import './NewsPanel.css'
import React from 'react'
import NewsCard from '../NewsCard/NewsCard'
import _ from 'lodash'
import Auth from "../Auth/Auth"
const config = require('../../../../config/config.json');

class NewsPanel extends React.Component{
    constructor(){
        super();
        this.state = {news:null, pageNum:1, loadedAll:null};
        this.handleScroll = this.handleScroll.bind(this);
    }

    componentDidMount() {
        this.loadMoreNews();
        this.loadMoreNews = _.debounce(this.loadMoreNews, 1000);
        window.addEventListener('scroll', this.handleScroll);
    }

    handleScroll() {
        let scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
        if ((window.innerHeight + scrollY) >= (document.body.offsetHeight - 50)) {
        console.log('Loading more news');
        this.loadMoreNews();
        }
   }

   componentWillUnmount() {
       window.removeEventListener('scroll', this.handleScroll);
   }

    loadMoreNews(e) {
        if(this.state.loadedAll === true) {
            console.log("Loaded All News");
            return;
        }

        const domain = config.webServer.domain;
        const port = config.webServer.port;
        let url = "http://" + domain + ":" + port + "/news/userId/"  + Auth.getEmail()
            + '/pageNum/' + this.state.pageNum;
        let request = new Request(encodeURI(url), {
            method: 'GET',
            cache: false,
            headers: {
                'Authorization': 'bearer ' + Auth.getToken(),
            }
        });
        fetch(request)
            .then((res) => res.json())
            .then((news) => {
                if(!news || news.length === 0) {
                    this.setState({loadedAll: true});

                }
                this.setState({
                    news: this.state.news? this.state.news.concat(news) : news,
                    pageNum: this.state.pageNum + 1
                });
            });
    }

    renderNews() {
        var news_list = this.state.news.map(function(news) {
            return(
                <a className="list-group-item" key={news.digest} href="#">
                    <NewsCard news={news}/>
                </a>
            );
        });

        return(
            <div className="container-fluid">
                <div className="list-group">
                    {news_list}
                </div>
                 {this.state.loadedAll && <p className="blue lighten-2">No more news to load</p> }
            </div>
        );        
    }

    render() {
        if (this.state.news) {
            return(
                <div>
                    {this.renderNews()}
                </div>
            );
        } else {
            return(
                <div>
                    <div id="msg-app-loading">
                        Loading
                    </div>
                </div>
            );
        }
    }
}

export default NewsPanel;