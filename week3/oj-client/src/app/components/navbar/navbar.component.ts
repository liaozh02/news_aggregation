import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  title = "AliceOJ";
  username = "";

  constructor(@Inject('auth0') private auth) { }

  ngOnInit() {
//    if (this.auth.authenticated()) {
//      this.username = this.auth.getProfile().nickname;
//    }
      this.auth.getProfile().subscribe(profile => { this.username = profile.nickname});
  }

  login(): void {
    this.auth.login();

  }

  logout(): void{
    this.auth.logout();
  }

}
