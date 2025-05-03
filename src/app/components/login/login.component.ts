import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {LoginPostRequest} from '../../request/login-post-request';
import {UserService} from '../../services/user.service';
import {TokenJwtResponse} from '../../response/token-jwt-response';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {SignInComponent} from '../sign-in/sign-in.component';
import {MenuService} from '../../services/menu.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, SignInComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  formLogin: FormGroup;

  constructor(private formBuild: FormBuilder,
              private userService: UserService,
              private router: Router,
              private authService: AuthService,
              protected menuService: MenuService,) {
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }

    this.buildForm();
  }

  buildForm(): void {
    this.formLogin = this.formBuild.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(8)]]
    });
  }

  submitForm(): void {
    const objUserForm: LoginPostRequest = this.formLogin.getRawValue();

    this.userService.login(objUserForm).subscribe({
      next: (res: TokenJwtResponse) => {
        this.authService.login(res.accessToken);
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  openSignup() {
    this.menuService.closeLogin();
    this.menuService.openRegister()
  }
}
