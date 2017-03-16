import { Injectable } from '@angular/core';
import { COLORS } from "../../assets/colors";

declare var io: any;
declare var ace: any;

@Injectable()
export class CollaborationService {

  collaborationSocket: any;
  partnerInfoLists: any = [];
  partnerNum: number = 0;
  constructor() { }

  init(editor: any, sessionId: string): void {
    this.collaborationSocket = io(window.location.origin, { query: 'sessionId=' + sessionId });

    this.collaborationSocket.on("change", (delta) => {
      console.log("collaboration receive change " + delta);
      delta = JSON.parse(delta);
      editor.lastAppliedChange = delta;
      editor.getSession().getDocument().applyDeltas([delta]);
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

  cursorMove(cursor: string): void {
    this.collaborationSocket.emit('cursorMove', cursor);
  }

}
