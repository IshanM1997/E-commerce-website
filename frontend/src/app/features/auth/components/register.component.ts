import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="brand">
          <span class="brand-icon">🛒</span>
          <h1>ShopSphere</h1>
          <p>Create your account</p>
        </div>
        <div class="success" *ngIf="success">{{ success }}</div>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" *ngIf="!success">
          <div class="field">
            <label>Full Name</label>
            <input type="text" formControlName="fullName" placeholder="John Doe">
          </div>
          <div class="field">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="you@example.com">
          </div>
          <div class="field">
            <label>Phone</label>
            <input type="text" formControlName="phone" placeholder="+91 00000 00000">
          </div>
          <div class="field">
            <label>Password</label>
            <input type="password" formControlName="password" placeholder="••••••••">
          </div>
          <div class="field">
            <label>Register As</label>
            <select formControlName="role">
              <option value="CUSTOMER">Customer</option>
              <option value="SELLER">Seller</option>
            </select>
          </div>
          <div class="error" *ngIf="error">{{ error }}</div>
          <button type="submit" [disabled]="loading" class="btn-primary">
            {{ loading ? 'Registering...' : 'Create Account' }}
          </button>
        </form>
        <p class="link-text">Already have an account? <a routerLink="/auth/login">Sign In</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { min-height:100vh; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); }
    .auth-card { background:#fff; border-radius:16px; padding:40px; width:100%; max-width:420px; box-shadow:0 20px 60px rgba(0,0,0,.2); }
    .brand { text-align:center; margin-bottom:24px; }
    .brand-icon { font-size:40px; }
    .brand h1 { margin:8px 0 4px; font-size:24px; color:#1a1a2e; font-weight:700; }
    .brand p { color:#666; font-size:14px; }
    .field { margin-bottom:16px; }
    label { display:block; font-size:13px; font-weight:600; color:#444; margin-bottom:6px; }
    input, select { width:100%; padding:11px 14px; border:2px solid #e8e8e8; border-radius:10px; font-size:14px; box-sizing:border-box; outline:none; }
    input:focus, select:focus { border-color:#667eea; }
    .btn-primary { width:100%; padding:14px; background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; border:none; border-radius:10px; font-size:16px; font-weight:600; cursor:pointer; margin-top:8px; }
    .error { background:#fff0f0; color:#c0392b; padding:10px 14px; border-radius:8px; font-size:13px; margin-bottom:16px; }
    .success { background:#f0fff4; color:#27ae60; padding:14px; border-radius:8px; font-size:14px; margin-bottom:16px; text-align:center; }
    .link-text { text-align:center; margin-top:20px; font-size:14px; color:#666; }
    .link-text a { color:#667eea; font-weight:600; text-decoration:none; }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  error = '';
  success = '';

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['CUSTOMER']
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true; this.error = '';
    this.auth.register(this.form.value).subscribe({
      next: () => { this.loading = false; this.success = 'Account created! Please wait for admin approval before logging in.'; },
      error: err => { this.loading = false; this.error = err.error || 'Registration failed'; }
    });
  }
}
