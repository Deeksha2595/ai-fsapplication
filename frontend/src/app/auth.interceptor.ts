import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private auth = inject(AuthService);
  private router = inject(Router);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();

    // Do not attach token to auth endpoints
    const isAuthEndpoint = req.url.startsWith(`${environment.apiBaseUrl}/api/auth/`);

    let cloned = req;
    if (token && !isAuthEndpoint) {
      cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next.handle(cloned).pipe(
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401 && !isAuthEndpoint) {
            // remove token and redirect to login
            this.auth.logout();
            // avoid redirect loops: only navigate if not already on /login
            if (this.router.url !== '/login') {
              this.router.navigate(['/login']).catch(() => {});
            }
          }
        }
        return throwError(() => err);
      })
    );
  }
}
