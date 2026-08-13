import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignUpResponse {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiBaseUrl;
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient, private router: Router) {}

  signup(payload: SignUpRequest): Observable<SignUpResponse> {
    return this.http.post<SignUpResponse>(`${this.base}/api/auth/signup`, payload);
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    return new Observable<LoginResponse>((subscriber) => {
      this.http.post<LoginResponse>(`${this.base}/api/auth/login`, payload).subscribe({
        next: (res) => {
          try {
            // store token securely in localStorage for now
            if (res && res.token) {
              localStorage.setItem(this.tokenKey, res.token);
            }
          } catch (e) {
            // ignore storage errors, do not log tokens
          }
          subscriber.next(res);
          subscriber.complete();
        },
        error: (err) => subscriber.error(err)
      });
    });
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (e) {
      return null;
    }
  }

  logout(): void {
    try {
      localStorage.removeItem(this.tokenKey);
    } catch (e) {
      // ignore
    }
    // navigate to login after clearing token
    try {
      this.router.navigate(['/login']).catch(() => {});
    } catch (e) {
      // ignore navigation errors
    }
  }

  me() {
    return this.http.get<UserResponse>(`${this.base}/api/users/me`);
  }
}
