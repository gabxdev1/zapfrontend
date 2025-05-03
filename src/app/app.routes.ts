import {Routes} from '@angular/router';
import {LoginComponent} from './components/login/login.component';
import {HomeComponent} from './pages/home/home.component';
import {AuthGuardService} from './guards/auth-guard.service';

export const routes: Routes = [

  {path: 'login', component: LoginComponent},
  {path: '', component: HomeComponent, canActivate: [AuthGuardService]}

];
