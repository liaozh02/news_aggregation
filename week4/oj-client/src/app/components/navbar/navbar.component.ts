import { Component, OnInit, Inject } from '@angular/core';
import { FormControl } from '@angular/forms'
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router'
import 'rxjs/add/operator/debounceTime'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  title = "AliceOJ";
  username = "";
  subscriptionProblems: Subscription;
  subscriptionKeyword: Subscription;

  searchBox: FormControl = new FormControl();

  constructor(@Inject('auth0') private auth,
              @Inject('search') private search,
              private router: Router) { }

  ngOnInit() {
    this.getProfile();
    this.setKeyword();
  }

  ngOnDestroy() {
    this.subscriptionProblems.unsubscribe();
  }

  getProfile(): void {
    this.subscriptionProblems = this.auth.getProfile().subscribe(profile => {
      if (profile)
        this.username = profile.nickname;
      else this.username = "";
    });
  }

  setKeyword(): void {
    this.subscriptionKeyword = this.searchBox.valueChanges
                                              .debounceTime(200)
                                              .subscribe(keyword => {
                                                  this.search.setKeyword(keyword);
                                              });
  }

  searchProblem(): void {
    this.router.navigate(['/problems']);
  }

  login(): void {
    this.auth.login();
  }

  logout(): void{
    this.auth.logout();
  }

}
