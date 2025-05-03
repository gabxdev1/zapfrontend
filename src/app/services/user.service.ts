import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {LoginPostRequest} from '../request/login-post-request';
import {environment} from '../../environments/environment';
import {TokenJwtResponse} from '../response/token-jwt-response';
import {BehaviorSubject, Observable} from 'rxjs';
import {UserGetResponse} from '../response/user-get-response';
import {RegisterPostRequest} from '../request/register-post-request';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private currentUser = new BehaviorSubject<UserGetResponse | null>(null);

  public currentUser$ = this.currentUser.asObservable();

  constructor(private http: HttpClient) {
  }

  public login(login: LoginPostRequest): Observable<TokenJwtResponse> {
    return this.http.post<TokenJwtResponse>(`${environment.api.baseURL}/auth/login`, login);
  }

  public register(register: RegisterPostRequest) {
    return this.http.post<any>(`${environment.api.baseURL}/auth/register`, register);
  }

  public getCurrentUser(): void {
    this.http.get<UserGetResponse>(
      `${environment.api.baseURL}/users/me`
    ).subscribe((response: UserGetResponse) => {
      this.currentUser.next(response)
    });
  }
}
