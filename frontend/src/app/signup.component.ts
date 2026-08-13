import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./app.component.css']
})
export class SignupComponent {
  signupForm!: any;

  submitting = false;
  successMessage: string | null = null;
  serverError: string | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.signupForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, this.passwordStrengthValidator()]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  get name() { return this.signupForm.get('name'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }
  get confirmPassword() { return this.signupForm.get('confirmPassword'); }

  private passwordStrengthValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value ?? '';
      if (!value) return null;
      const hasUppercase = /[A-Z]/.test(value);
      const hasLowercase = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSpecialCharacter = /[^A-Za-z0-9]/.test(value);
      const validLength = value.length >= 8 && value.length <= 72;
      return (hasUppercase && hasLowercase && hasNumber && hasSpecialCharacter && validLength) ? null : { passwordStrength: true };
    };
  }

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (!password || !confirmPassword) return null;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.signupForm.invalid || this.submitting) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.successMessage = null;
    this.serverError = null;

    const payload = {
      name: ((this.name?.value ?? '') as string).trim(),
      email: ((this.email?.value ?? '') as string).trim().toLowerCase(),
      password: (this.password?.value ?? '') as string,
      confirmPassword: (this.confirmPassword?.value ?? '') as string,
    };

    this.auth.signup(payload).subscribe({
      next: (res) => {
        this.successMessage = 'Registration successful.';
        // navigate to /login route
        this.router.navigate(['/login']).catch(() => {});
      },
      error: (err) => {
        const body = err?.error;
        if (body && body.details) {
          const first = Object.values(body.details)[0];
          this.serverError = first ?? body.message ?? 'Validation failed.';
        } else if (body && body.message) {
          this.serverError = body.message;
        } else if (err && err.status === 0) {
          this.serverError = 'Unable to reach the server.';
        } else {
          this.serverError = 'An unexpected server error occurred.';
        }
        // ensure submitting flag is cleared on error
        this.submitting = false;
      },
      complete: () => { this.submitting = false; }
    });
  }
}
