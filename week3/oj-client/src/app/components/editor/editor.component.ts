import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Params} from '@angular/router';
import { Router } from '@angular/router'

declare var ace: any;
@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {

  editor: any;

  defaultContent = {
    'Java': `public class Example {
      public static void main(String[] args){
        //Type your code here
      }
    }`,
    'C++': `#include <iostream>
    using namespace std;    ​
    int main() {
       // Type your C++ code here
       return 0;
    }`,
    'Python': `class Solution:
      def example():
      # Write your Python code here`
  }

  modeMap = {
    'Java': 'java',
    'C++': 'c_cpp',
    'Python': 'python'
  }

  public languages: string[] = ['Java', 'C++', 'Python'];
  public types: string[] = ['PRIVATE', 'PUBLIC', 'SHARE'];
  language: string = 'Java'; // default
 // type: string = 'PRIVATE';//default
  sessionId: string = "";
  problemId: string = "";
  userName: string = "";
 // shareList: string[] = [];
  newPerson:string;
  url = window.location.href;

  constructor(@Inject('collaboration') private collaboration,
              @Inject('auth0') private auth,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    this.route.params
      .subscribe(params => {
        this.problemId = params['id'];
        if(this.auth.authenticated()) {
          this.userName = this.auth.getCurrentProfile().nickname;          
          let key = this.userName + '/' + this.problemId + '/';
          if(params['session']) {
            this.sessionId = params['session'];
          } else if(localStorage.getItem(key)){
            this.sessionId = localStorage.getItem(key);
            console.log("Browser sessionId record:" + this.sessionId);
            let state = {
              id: this.problemId,
              name: 'session'
            }
            window.history.pushState(state, "session", `/problems/${this.problemId}/${this.sessionId}`);
            this.editor.url = window.location.href;
          }
          else{
            this.sessionId = "";
          }
        }       
        this.initEditor();
      })    
    }


  initEditor(){
    this.editor = ace.edit("editor");
    this.editor.setTheme("ace/theme/eclipse");
    this.resetEditor();
    this.editor.$blockScrolling = Infinity;
    document.getElementsByTagName('textarea')[0].focus();
    if(this.auth.authenticated()) {
      this.editor.userName = this.auth.getCurrentProfile().nickname;
      this.editor.language = this.language;
      this.editor.problemId = this.problemId;
      this.initSocket();
    }
  }

  initSocket() {
    this.collaboration.init(this.editor, this.sessionId);
    this.editor.lastAppliedChange = null;

    window.onpopstate = (() =>{
      console.log('window changed, disconnect socket');
      this.collaboration.disconnectSocket();
    })


    this.editor.getSession().on('change', (e) =>{
      if( this.editor.lastAppliedChange != e && !this.collaboration.fromSetValue) {
        console.log('editor change request ' + JSON.stringify(e));
        this.collaboration.change(JSON.stringify(e));
      }
    });

   this.editor.getSession().getSelection().on('changeCursor', function(){
        if(!this.collaboration.fromSetValue) {
          var cursor = this.editor.getSession().getSelection().getCursor();
          console.log('Curson change request ' + JSON.stringify(cursor));
          this.collaboration.cursorMove(JSON.stringify(cursor)); 
      }
    }.bind(this));

//    this.collaboration.restoreBuffer();
  }


  setLanguage(language: string) {
    this.language = language;
    this.resetEditor();
  }

  setPublic() {
    this.editor.type ="PUBLIC";
    this.editor.shareList = [];
    console.log("session set to public");
    let data = {
      'type': this.editor.type,
      'shareList': this.editor.shareList
    }
    this.collaboration.changeType(JSON.stringify(data));
  }

  addShare() {
    this.editor.type = "SHARE";
    this.editor.shareList.push(this.newPerson);
    let data = {
      'type': this.editor.type,
      'shareList': this.editor.shareList
    }
    this.collaboration.changeType(JSON.stringify(data));

  }
  resetEditor(): void {
    this.editor.getSession().setMode("ace/mode/"+ this.modeMap[this.language]);
//    this.editor.setValue(this.defaultContent[this.language]);
    this.editor.getSession().getDocument().setValue(this.defaultContent[this.language]);
    this.editor.type = "PRIVATE";
    this.editor.shareList = [];
  }

  submit(): void {
    let userCode = this.editor.getValue();
    console.log(userCode);
  }

  login(): void {
    console.log("sign in");
    this.auth.login();
  }

}
