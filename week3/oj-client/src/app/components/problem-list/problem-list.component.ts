import { Component, OnInit, Inject } from '@angular/core';
import { Problem } from "../../models/problem.model";
import { Subscription } from 'rxjs/Subscription';


@Component({
  selector: 'app-problem-list',
  templateUrl: './problem-list.component.html',
  styleUrls: ['./problem-list.component.css']
})
export class ProblemListComponent implements OnInit {

  problems: Problem[] = [];
  subscriptionProblems: Subscription;
  subscriptionKeyword: Subscription;
  keyword: string = "";

  constructor(@Inject("data") private data,
              @Inject("search") private search ) { }

  ngOnInit() {
    this.getProblems();
    this.getKeyword();
  }

  ngOnDestroy() {
    this.subscriptionProblems.unsubscribe();
    this.subscriptionKeyword.unsubscribe();
  }

  getProblems(): void {
    this.subscriptionProblems = this.data.getProblems()
                                        .subscribe(problems => this.problems = problems);
  }

  getKeyword(): void {
    this.subscriptionKeyword = this.search.getKeyword()
                                        .subscribe(keyword => {
                                          this.keyword = keyword;
                                        });
  }

}
