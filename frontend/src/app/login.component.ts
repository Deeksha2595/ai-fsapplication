import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, LoginRequest } from './auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <main class="page-shell">
      <section class="signup-card" aria-labelledby="login-title">
        <div class="card-header">
          <p class="eyebrow">Welcome back</p>
          <h1 id="login-title">Log in</h1>
          <p class="subtitle">Sign in to your account.</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onLoginSubmit()" novalidate>
          <div class="field-group">
            <label for="login-email">Email</label>
            <input id="login-email" type="email" formControlName="email" placeholder="you@example.com" [class.invalid]="loginEmail?.invalid && loginEmail?.touched" />
            <div class="error-message" *ngIf="loginEmail?.touched && loginEmail?.errors">
              <span *ngIf="loginEmail?.errors?.['required']">Email is required.</span>
              <span *ngIf="loginEmail?.errors?.['email']">Please enter a valid email address.</span>
            </div>
          </div>

          <div class="field-group">
            <label for="login-password">Password</label>
            <input id="login-password" type="password" formControlName="password" placeholder="Your password" [class.invalid]="loginPassword?.invalid && loginPassword?.touched" />
            <div class="error-message" *ngIf="loginPassword?.touched && loginPassword?.errors">
              <span *ngIf="loginPassword?.errors?.['required']">Password is required.</span>
            </div>
          </div>

          <div *ngIf="loginError" class="error-message" style="margin-bottom:8px">{{ loginError }}</div>

          <button class="submit-button" type="submit" [disabled]="loginForm.invalid || loginSubmitting">
            <span *ngIf="!loginSubmitting">Log in</span>
            <span *ngIf="loginSubmitting">Signing in...</span>
          </button>

          <p class="login-text" style="margin-top:12px">
            New here? <a routerLink="/signup">Create account</a>
          </p>

          <div *ngIf="successMessage" style="margin-top:12px; color: #065f46; font-weight:600">{{ successMessage }}</div>
        </form>
      </section>
    </main>
  `,
  styleUrls: ['./app.component.css']
})
export class LoginComponent {
  loginForm!: any;

  loginSubmitting = false;
  loginError: string | null = null;
  successMessage: string | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  get loginEmail() { return this.loginForm.get('email'); }
  get loginPassword() { return this.loginForm.get('password'); }

  onLoginSubmit(): void {
    if (this.loginForm.invalid || this.loginSubmitting) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loginSubmitting = true;
    this.loginError = null;
    this.successMessage = null;

    const payload: LoginRequest = {
      email: ((this.loginEmail?.value ?? '') as string).trim().toLowerCase(),
      password: (this.loginPassword?.value ?? '') as string
    };

    this.auth.login(payload).subscribe({
      next: (res) => {
        // redirect to /dashboard only if that route exists in router config
        const hasDashboard = !!this.router.config?.some(r => r && (r['path'] === 'dashboard'));
        if (hasDashboard) {
          this.router.navigate(['/dashboard']).catch(() => { this.successMessage = 'Login successful.'; });
        } else {
          this.successMessage = 'Login successful.';
        }
      },
      error: (err) => {
        if (err && err.status === 401) {
          this.loginError = 'Invalid email or password.';
        } else if (err && err.status === 0) {
          this.loginError = 'Unable to reach the server.';
        } else {
          this.loginError = 'An unexpected server error occurred.';
        }
        // clear submitting flag on error
        this.loginSubmitting = false;
      },
      complete: () => { this.loginSubmitting = false; }
    });
  }
}
