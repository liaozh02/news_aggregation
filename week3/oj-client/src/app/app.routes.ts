import { Routes, RouterModule} from "@angular/router";
import { ProblemListComponent } from './components/problem-list/problem-list.component';
import { ProblemDetailComponent } from './components/problem-detail/problem-detail.component';
import { ProfileComponent } from './components/profile/profile.component'
import { AuthGuardService } from './services/auth-guard.service'
const routes: Routes = [
  {
    path: "",
    redirectTo: "problems",
    pathMatch: "full"
  },
  {
    path: "problems",
    component: ProblemListComponent
  },
  {
    path: "problems/:id",
    component: ProblemDetailComponent
  },
  {
    path: "problems/:id/:session",
    component: ProblemDetailComponent
  },
  {
    path: "profile",
    component: ProfileComponent,
    canActivate: ['authGuard']
  },
  {
    path: "**",
    redirectTo: "problems",
  }
];

export const routing = RouterModule.forRoot(routes);
