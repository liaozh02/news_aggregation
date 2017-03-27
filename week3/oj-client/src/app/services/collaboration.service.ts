import { Injectable } from '@angular/core';
import { COLORS } from "../../assets/colors";

declare var io: any;
declare var ace: any;

@Injectable()
export class CollaborationService {

  collaborationSocket: any;
  partnerInfoLists: any = [];
  partnerNum: number = 0;
  fromSetValue: boolean = false;
  constructor() { }

  init(editor: any, sessionId: string): void {
    this.collaborationSocket = io(window.location.origin, 
                                {query: 'sessionId=' + sessionId + '&' + 'client=' + editor.userName
                                        + '&' + 'problemId=' + editor.problemId + '&' +  'type=' + editor.type});

    this.collaborationSocket.on("create", (sessionId) => {
      console.log("Got new session Id:" + sessionId + " from Server ");
      editor.sessionId = sessionId;
      let key = editor.userName + '/' + editor.problemId + '/';
      localStorage.setItem(key, sessionId);
      let state = {
          id: editor.problemId,
          name: 'session'
      }
      window.history.pushState(state, "session", `/problems/${editor.problemId}/${editor.sessionId}`);   
      this.restoreBuffer();
   });
    
    this.collaborationSocket.on("change", (delta) => {
      console.log("collaboration receive change " + delta);
      delta = JSON.parse(delta);
      editor.lastAppliedChange = delta;
      editor.getSession().getDocument().applyDeltas([delta]);
    });


    this.collaborationSocket.on('snapshot', (data) =>{
      console.log("collaboration receive snapshot");
      //console.log(data);
      this.fromSetValue = true;
      editor.getSession().getDocument().setValue(data);
      this.fromSetValue = false;
    });

    this.collaborationSocket.on('sessionProp', (data) =>{
      console.log("collaboration receive session property change from server");
      //console.log(data);
      data = JSON.parse(data);
      editor.type = data['type'];
      editor.shareList = data['shareList'];
      console.log("type change to:" + editor.type +" shareList: " + editor.shareList)
    });


    this.collaborationSocket.on("cursorMove", (cursor) => {
      console.log("collaboration receive cursorMove " + cursor);
      cursor = JSON.parse(cursor);
      let partnerId = cursor.clientId;
      let x = cursor.row;
      let y = cursor.column;
      console.log("x: " + x + "y: " + y + " " + partnerId);

      if(partnerId in this.partnerInfoLists) {
          editor.getSession().removeMarker(this.partnerInfoLists[partnerId]['marker']);
          console.log("remove Marker for " + partnerId);
        }
        else {
          this.partnerInfoLists[partnerId] = {};

          let css = document.createElement('style');
          css.type = "text/css";
          css.innerHTML = ".editor_cursor_" + partnerId
            + "{ position: absolute; background:" + COLORS[this.partnerNum] + ";"
            + " z-index: 100; width: 3px !important; }";
          document.body.appendChild(css);
          this.partnerNum++;
        }

        let Range = ace.require('ace/range').Range;
        let newMarker = editor.getSession().addMarker(new Range(x, y, x, y+1),
              'editor_cursor_' + partnerId, true);
        this.partnerInfoLists[partnerId]['marker'] = newMarker;
    });
  }

  change(delta: string): void {
    this.collaborationSocket.emit('change', delta);
  }

  changeType(data: any): void{
    console.log("emit change: " + data + "to server");
    this.collaborationSocket.emit('changeType',data);
  }

  cursorMove(cursor: string): void {
    this.collaborationSocket.emit('cursorMove', cursor);
  }

  restoreBuffer(): void {
    this.collaborationSocket.emit('restoreBuffer');
  }

  disconnectSocket(): void {
    this.collaborationSocket.close();
  }
}
