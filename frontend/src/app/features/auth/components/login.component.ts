import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="brand">
          <span class="brand-icon">🛒</span>
          <h1>ShopSphere</h1>
          <p>Sign in to your account</p>
        </div>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="field">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="you@example.com">
          </div>
          <div class="field">
            <label>Password</label>
            <input type="password" formControlName="password" placeholder="••••••••">
          </div>
          <div class="error" *ngIf="error">{{ error }}</div>
          <button type="submit" [disabled]="loading" class="btn-primary">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
        <p class="link-text">Don't have an account? <a routerLink="/auth/register">Register</a></p>
        <div class="demo-creds">
          <b>Demo:</b> admin&#64;ecommerce.com / Admin&#64;123
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { min-height:100vh; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); }
    .auth-card { background:#fff; border-radius:16px; padding:40px; width:100%; max-width:420px; box-shadow:0 20px 60px rgba(0,0,0,.2); }
    .brand { text-align:center; margin-bottom:32px; }
    .brand-icon { font-size:48px; }
    .brand h1 { margin:8px 0 4px; font-size:28px; color:#1a1a2e; font-weight:700; }
    .brand p { color:#666; font-size:14px; }
    .field { margin-bottom:20px; }
    label { display:block; font-size:13px; font-weight:600; color:#444; margin-bottom:6px; }
    input { width:100%; padding:12px 14px; border:2px solid #e8e8e8; border-radius:10px; font-size:14px; box-sizing:border-box; transition:.2s; outline:none; }
    input:focus { border-color:#667eea; }
    .btn-primary { width:100%; padding:14px; background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; border:none; border-radius:10px; font-size:16px; font-weight:600; cursor:pointer; margin-top:8px; }
    .btn-primary:disabled { opacity:.7; cursor:not-allowed; }
    .error { background:#fff0f0; color:#c0392b; padding:10px 14px; border-radius:8px; font-size:13px; margin-bottom:16px; }
    .link-text { text-align:center; margin-top:20px; font-size:14px; color:#666; }
    .link-text a { color:#667eea; font-weight:600; text-decoration:none; }
    .demo-creds { margin-top:16px; background:#f7f9ff; padding:12px; border-radius:8px; font-size:12px; color:#555; text-align:center; }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true; this.error = '';
    this.auth.login(this.form.value.email, this.form.value.password).subscribe({
      next: () => { this.loading = false; this.auth.redirectByRole(); },
      error: err => { this.loading = false; this.error = err.error || 'Login failed'; }
    });
  }
}
