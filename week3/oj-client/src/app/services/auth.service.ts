import { Injectable }      from '@angular/core';
import { tokenNotExpired } from 'angular2-jwt';
import { BehaviorSubject} from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';

// Avoid name not found warnings
//declare var Auth0Lock: any;
let Auth0Lock: any = require('auth0-lock').default;

@Injectable()
export class Auth {
  // Configure Auth0
  clientId = 'g6ysFTRK5Cpe45KHrsO0Wq3AodGHE4cV';
  domain = 'aliceliao.auth0.com';

  lock = new Auth0Lock(this.clientId, this.domain, {});
  //Store profile object in auth class
  userProfile: Object;

  private profileSource = new BehaviorSubject<Object>([]);
  constructor() {
    // Set userProfile attribute of already saved profile
    this.userProfile = JSON.parse(localStorage.getItem('profile'));
    this.profileSource.next(this.userProfile);
//      console.log("Begin" + this.userProfile);
    this.lock.on("authenticated", (authResult) => {
    // Fetch profile information
      this.lock.getProfile(authResult.idToken, (error, profile) => {
        if (error) {
        // Handle error
          alert(error);
        }
        // Save token and profile locally
        localStorage.setItem("idToken", authResult.idToken);
        localStorage.setItem("profile", JSON.stringify(profile));
        this.userProfile = profile;
        this.profileSource.next(this.userProfile);
//        debugger;
//        console.log("After" + JSON.stringify(this.userProfile));
      });
    });
  }

  public login() {
    // Call the show method to display the widget.
    this.lock.show();
  }

  public authenticated() {
    // Check if there's an unexpired JWT
    // This searches for an item in localStorage with key == 'id_token'
    return tokenNotExpired();
  }

  public logout() {
    // Remove token from localStorage
    localStorage.removeItem('idToken');
    localStorage.removeItem('profile');
  //  this.userProfile = undefined;
  this.userProfile = null;
  }

  public getProfile(): Observable<Object> {
    return this.profileSource.asObservable();
  }
}
