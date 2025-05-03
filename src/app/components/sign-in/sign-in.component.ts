import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {UserService} from '../../services/user.service';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {LoginPostRequest} from '../../request/login-post-request';
import {TokenJwtResponse} from '../../response/token-jwt-response';
import {RegisterPostRequest} from '../../request/register-post-request';
import {MenuService} from '../../services/menu.service';

@Component({
  selector: 'app-sign-in',
    imports: [
        ReactiveFormsModule
    ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements OnInit {
  formSignIn: FormGroup;

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
    this.formSignIn = this.formBuild.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(8)]],
      nickname: [null, [Validators.required, Validators.minLength(3)]],
      firstName: [null, [Validators.required, Validators.minLength(3)]],
      lastName: [null, [Validators.required, Validators.minLength(3)]],
    });
  }

  submitForm(): void {
    const objUserForm: RegisterPostRequest = this.formSignIn.getRawValue();

    this.userService.register(objUserForm).subscribe({
      next: (result) => {
        console.log(result);
        this.userService.login({email: objUserForm.email, password: objUserForm.password}).subscribe({
          next: (res: TokenJwtResponse) => {
            this.authService.login(res.accessToken);
            this.router.navigate(['/']);
          },
          error: (error) => {
            console.error(error);
          }
        })
      },
      error: err => {
        console.error(err);
      }
    })
  }

  openLogin() {
    this.menuService.closeRegister();
    this.menuService.openLogin()
  }
}
