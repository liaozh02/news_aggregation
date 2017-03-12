import { Injectable, Inject } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import 'rxjs/add/operator/toPromise';
@Injectable()
export class AuthGuardService implements CanActivate{

  constructor(@Inject('auth0') private auth, private router: Router) { }

  canActivate(): boolean {
    if(this.auth.authenticated()) {
  //    console.log("pass guard");
      return true;
    } else {
      //redirect to homepage
      this.router.navigate(['/problems']);
    }
  }

  isAdmin(): boolean {
    if(this.auth.authenticated() &&
          this.auth.userProfile.roles.includes('Admin')) {
            return true;
    } else {
      return false;
    }
  }
}
