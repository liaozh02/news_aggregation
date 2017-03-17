import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Params} from '@angular/router';

declare var ace: any;
@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {

  editor: any;

  defaultContent = {
    'Java': `public class Example() {
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
  language: string = 'Java'; // default
  sessionId: string;

  constructor(@Inject('collaboration') private collaboration,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params
      .subscribe(params => {
        this.sessionId = params['id'];
        this.initEditor();
      })
    }

  initEditor(){
    this.editor = ace.edit("editor");
    this.editor.setTheme("ace/theme/eclipse");
//    this.editor.setTheme("ace/theme/xcode");
    this.resetEditor();
    this.editor.$blockScrolling = Infinity;
    document.getElementsByTagName('textarea')[0].focus();
    this.collaboration.init(this.editor, this.sessionId);
    this.editor.lastAppliedChange = null;

    this.editor.on('change', (e) =>{
      if( this.editor.lastAppliedChange != e) {
        console.log('editor change request ' + JSON.stringify(e));
        this.collaboration.change(JSON.stringify(e));
      }
    });

   this.editor.getSession().getSelection().on('changeCursor', function(){
        var cursor = this.editor.getSession().getSelection().getCursor();
        console.log('Curson change request ' + JSON.stringify(cursor));
        this.collaboration.cursorMove(JSON.stringify(cursor));
    }.bind(this));

    this.collaboration.restoreBuffer();
  }

  setLanguage(language: string) {
    this.language = language;
    this.resetEditor();
  }

  resetEditor(): void {
    this.editor.getSession().setMode("ace/mode/"+ this.modeMap[this.language]);
    this.editor.setValue(this.defaultContent[this.language]);
  }

  submit(): void {
    let userCode = this.editor.getValue();
    console.log(userCode);
  }

}
