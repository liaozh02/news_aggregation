import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from "rxjs/Rx"

@Injectable()
export class SearchService {

  private searchKeyword = new BehaviorSubject<string>('');

  constructor() { }

  setKeyword(keyword: string): void{
    this.searchKeyword.next(keyword);
  }

  getKeyword(): Observable<string> {
    return this.searchKeyword.asObservable();
  }

}
