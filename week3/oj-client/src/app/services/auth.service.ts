import { Injectable }      from '@angular/core';
import { tokenNotExpired } from 'angular2-jwt';
import { BehaviorSubject} from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';
import { Http, Response, Headers} from '@angular/http'
import 'rxjs/add/operator/toPromise';
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
  userProfile: any;

  private profileSource = new BehaviorSubject<Object>([]);
  constructor(private http: Http) {
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

  public resetPassword(): void {
    let profile = this.userProfile;
    let url: string = `https://${this.domain}/dbconnections/change_password`;
    let headers = new Headers({ 'content-type': 'application/json' });
    let body = {
                client_id: this.clientId,
                email: profile.email,
                connection: 'Username-Password-Authentication' }
//    console.log(body);
    this.http.post(url, body, headers)
      .toPromise()
      .then((res: Response) => {
        console.log(res.json());
      })
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error("Error happened!", error);
    return Promise.reject(error.message || error);
  }
}
