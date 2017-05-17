import './NewsPanel.css'
import React from 'react'
import NewsCard from '../NewsCard/NewsCard'
import _ from 'lodash'
import Auth from "../Auth/Auth"
import SideNav from "../SideNav/SideNav"
const config = require('../../../../config/config.json');

class NewsPanel extends React.Component{
    constructor(){
        super();
        this.state = {news:null, pageNum:1, loadedAll:null, topic:""};
        this.handleScroll = this.handleScroll.bind(this);
        this.changeTopic =  this.changeTopic.bind(this);
    }

    componentDidMount() {
        this.loadMoreNews();
        this.loadMoreNews = _.debounce(this.loadMoreNews, 1000);
        window.addEventListener('scroll', this.handleScroll);      
    }

    componentDidUpdate(){
        var cnt = 0;
        if(this.state.news && this.state.topic !== ""){
            this.state.news.forEach((news) => {
                if(news.class === this.state.topic) {
                    cnt++;
                }
            })
            console.log(cnt + "news in totoal "+ this.state.news.length);
            if(cnt < 3) {
                console.log("current cnt"+ cnt);
                this.loadMoreNews();
            }
        }
            
    }

    changeTopic(newTopic) {
        console.log("changeTopc to" + newTopic);
        this.setState({topic: newTopic})
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
                console.log("now page: " + this.state.pageNum);
                this.setState({
                    news: this.state.news? this.state.news.concat(news) : news,
                    pageNum: this.state.pageNum + 1
                });
            });
    }

    renderNews() {
        var news_list = this.state.news.map((news) =>{
            if(this.state.topic !== "") {
                if(news.class === this.state.topic){
                    return(
                        <a className="list-group-item" key={news.digest} href="#">
                            <NewsCard news={news}/>
                        </a>
                    );
                }
            }
            else {
                return(
                        <a className="list-group-item" key={news.digest} href="#">
                            <NewsCard news={news}/>
                        </a>
                    );
            }
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
                    <div className='col s1'>
                        <SideNav changeTopic={this.changeTopic}/>
                    </div>
                    <div className='col s9 offset-s1'>
                        {this.renderNews()}
                    </div>
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