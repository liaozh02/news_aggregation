import { Injectable, Inject } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import 'rxjs/add/operator/toPromise';
@Injectable()
export class AuthGuardService implements CanActivate{

  constructor(@Inject('auth0') private auth, private router: Router) { }

  canActivate(): boolean {
    if(this.auth.authenticated()) {
      return true;
    } else {
      //redirect to homepage
      this.router.navigate(['/problems']);
      return false;
    }
  }

  isAdmin(): boolean {
    if(this.auth.authenticated() &&
          this.auth.getCurrentProfile().roles.includes('Admin')) {
            return true;
    } else {
      return false;
    }
  }
}
