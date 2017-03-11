import { Component, OnInit, Inject } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  title = "AliceOJ";
  username = "";
  subscriptionProblems: Subscription;

  constructor(@Inject('auth0') private auth) { }

  ngOnInit() {
      this.getProfile();
  }

  getProfile(): void {
    this.subscriptionProblems = this.auth.getProfile().subscribe(profile => {
      if (profile)
        this.username = profile.nickname;
      else this.username = "";
    });
  }
  login(): void {
    this.auth.login();
  }

  logout(): void{
    this.auth.logout();
  }

}
