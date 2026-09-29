import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowRight, LucideEye, LucideEyeOff, LucideLockKeyhole, LucideMail, LucideShieldCheck } from '@lucide/angular';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideArrowRight,
    LucideLockKeyhole,
    LucideEye,
    LucideEyeOff,
    LucideMail,
    LucideShieldCheck
  ],
  template: `
    <div class="auth-page">
      <div class="auth-brand-panel">
        <div class="brand-row">
          <div class="brand-mark"><svg lucideShieldCheck width="19" height="19"></svg></div>
          <div>
            <strong>OASIS</strong>
            <span>Task Manager</span>
          </div>
        </div>

        <div class="brand-copy">
          <span class="eyebrow">WELCOME BACK</span>
          <h1>Turn your plans into <em>progress.</em></h1>
          <p>Sign in to pick up where you left off and keep your work moving.</p>
        </div>

        <div class="brand-footer">
          <span>Secure workspace</span>
          <span>·</span>
          <span>Your tasks stay yours</span>
        </div>
      </div>

      <main class="auth-content">
        <section class="auth-card">
          <div class="card-heading">
            <span class="eyebrow">SIGN IN</span>
            <h2>Welcome back</h2>
            <p>Enter your account details to continue.</p>
          </div>

          <form #form="ngForm" (ngSubmit)="submit()" novalidate>
            <label>
              Email address
              <div class="input-wrap">
                <svg lucideMail width="17" height="17"></svg>
                <input
                  type="email"
                  name="email"
                  [(ngModel)]="email"
                  required
                  autocomplete="email"
                  placeholder="you@example.com">
              </div>
            </label>

            <label>
              Password
              <div class="input-wrap">
                <svg lucideLockKeyhole width="17" height="17"></svg>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  name="password"
                  [(ngModel)]="password"
                  required
                  autocomplete="current-password"
                  placeholder="Enter your password">
                <button class="password-toggle" type="button" (click)="showPassword = !showPassword"
                        [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'"
                        [attr.title]="showPassword ? 'Hide password' : 'Show password'">
                  <svg *ngIf="showPassword" lucideEyeOff width="16" height="16"></svg>
                  <svg *ngIf="!showPassword" lucideEye width="16" height="16"></svg>
                </button>
              </div>
            </label>

            <div class="error" *ngIf="error">{{ error }}</div>

            <button class="submit-btn" type="submit" [disabled]="loading || !form.valid">
              <span>{{ loading ? 'Signing in...' : 'Sign in' }}</span>
              <svg lucideArrowRight width="17" height="17"></svg>
            </button>
          </form>

          <p class="switch">Don't have an account? <a routerLink="/register">Create one</a></p>
        </section>
      </main>
    </div>
  `,
  styles: [`
    :host{display:block;min-height:100vh}
    *{box-sizing:border-box}
    button,input{font:inherit}
    .auth-page{min-height:100vh;display:grid;grid-template-columns:minmax(360px,44%) 1fr;background:#f7f7f6;color:#32373b}
    .auth-brand-panel{padding:42px 54px;background:#32373b;color:#fff;display:flex;flex-direction:column;justify-content:space-between;min-height:100vh}
    .brand-row{display:flex;align-items:center;gap:11px}.brand-mark{width:36px;height:36px;border-radius:10px;background:#f4b860;color:#32373b;display:grid;place-items:center}.brand-row strong{display:block;font-size:15px;letter-spacing:.14em}.brand-row span{display:block;color:#bfc4c5;font-size:11px;margin-top:2px}
    .brand-copy{max-width:390px;margin:auto 0}.eyebrow{font-size:10px;font-weight:800;letter-spacing:.16em;color:#929a9b}.brand-copy .eyebrow{color:#f4b860}.brand-copy h1{font-size:clamp(36px,4vw,55px);line-height:1.02;letter-spacing:-.045em;margin:15px 0}.brand-copy em{color:#f4d6cc;font-style:normal}.brand-copy p{max-width:340px;color:#c2c7c8;font-size:14px;line-height:1.7;margin:0}
    .brand-footer{display:flex;gap:8px;color:#899293;font-size:10px}
    .auth-content{display:grid;place-items:center;padding:30px}
    .auth-card{width:min(430px,100%);background:#fff;border:1px solid #e7e3e0;border-radius:18px;padding:34px;box-shadow:0 18px 55px rgba(50,55,59,.07)}
    .card-heading{margin-bottom:26px}.card-heading h2{font-size:27px;letter-spacing:-.035em;margin:8px 0 6px}.card-heading p{color:#8a9293;font-size:12px;margin:0;line-height:1.6}
    form{display:grid;gap:17px}label{display:grid;gap:7px;color:#596162;font-size:11px;font-weight:800}.input-wrap{display:flex;align-items:center;gap:9px;border:1px solid #ddd9d6;border-radius:10px;padding:0 12px;background:#fff;transition:.18s}.input-wrap:focus-within{border-color:#f4b860;box-shadow:0 0 0 3px rgba(244,184,96,.14)}.input-wrap svg{color:#919899;flex:none}.password-toggle{border:0;background:transparent;color:#858d8e;padding:4px;display:grid;place-items:center;border-radius:6px}.password-toggle:hover{background:#f2f1ef;color:#32373b}.input-wrap input{border:0;outline:0;width:100%;padding:12px 0;background:transparent;color:#32373b;font-size:12px}
    .error{padding:10px 11px;border-radius:9px;background:#fae1e4;color:#b53140;font-size:11px;line-height:1.45}
    .submit-btn{border:0;border-radius:10px;background:#c83e4d;color:#fff;padding:13px 15px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:12px;font-weight:800;box-shadow:0 8px 20px rgba(200,62,77,.17);transition:.18s}.submit-btn:hover:not(:disabled){transform:translateY(-1px);filter:brightness(.96)}.submit-btn:disabled{opacity:.5;cursor:not-allowed}
    .switch{text-align:center;color:#8b9394;font-size:11px;margin:23px 0 0}.switch a{color:#c83e4d;font-weight:800;text-decoration:none}.switch a:hover{text-decoration:underline}
    @media(max-width:760px){.auth-page{grid-template-columns:1fr}.auth-brand-panel{min-height:auto;padding:28px 24px}.brand-copy{margin:62px 0 30px}.brand-copy h1{font-size:38px}.brand-footer{display:none}.auth-content{padding:24px}.auth-card{padding:26px}}
  `]
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  showPassword = false;
  loading = false;
  error = '';

  submit(): void {
    if (!this.email.trim() || !this.password || this.loading) return;

    this.loading = true;
    this.error = '';

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: error => {
        this.loading = false;
        this.error = error?.error?.message || 'Unable to sign in. Check your email and password.';
      }
    });
  }
}
