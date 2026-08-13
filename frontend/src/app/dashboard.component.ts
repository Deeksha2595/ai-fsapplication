import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, UserResponse } from './auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="page-shell">
      <section class="signup-card">
        <div class="card-header">
          <p class="eyebrow">Dashboard</p>
          <h1>Welcome, {{ user?.name || 'User' }}</h1>
          <p class="subtitle">This is a protected page. Only authenticated users can see this.</p>
        </div>

        <div style="margin-top:12px">
          <p><strong>Email:</strong> {{ user?.email }}</p>
          <p style="color:#374151;">The dashboard content is intentionally minimal for this step.</p>
        </div>

        <div style="margin-top:16px">
          <button class="submit-button" (click)="onLogout()">Logout</button>
        </div>

        <p style="margin-top:12px"><a routerLink="/signup">Back to Signup</a> • <a routerLink="/login">Login</a></p>
      </section>
    </main>
  `,
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  user: UserResponse | null = null;

  constructor(private auth: AuthService) {
    this.loadProfile();
  }

  loadProfile() {
    this.auth.me().subscribe({
      next: (u) => { this.user = u; },
      error: () => { this.user = null; }
    });
  }

  onLogout() {
    this.auth.logout();
  }
}
