import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private tokenKey = 'token';

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  login(token: string) {
    sessionStorage.setItem(this.tokenKey, token);
  }

  logout() {
    sessionStorage.removeItem(this.tokenKey);
  }
}
