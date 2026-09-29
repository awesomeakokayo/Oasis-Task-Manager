import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowRight, LucideLockKeyhole, LucideMail, LucideShieldCheck, LucideUserRound } from '@lucide/angular';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideArrowRight,
    LucideLockKeyhole,
    LucideMail,
    LucideShieldCheck,
    LucideUserRound
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
          <span class="eyebrow">NEW WORKSPACE</span>
          <h1>A calmer place to <em>get things done.</em></h1>
          <p>Create your account, organize your tasks, and keep every commitment in one focused workspace.</p>
        </div>

        <div class="brand-footer">
          <span>Simple task management</span>
          <span>·</span>
          <span>Secure by design</span>
        </div>
      </div>

      <main class="auth-content">
        <section class="auth-card">
          <div class="card-heading">
            <span class="eyebrow">CREATE ACCOUNT</span>
            <h2>Set up your workspace</h2>
            <p>Your account is ready in less than a minute.</p>
          </div>

          <form #form="ngForm" (ngSubmit)="submit()" novalidate>
            <label>
              Full name
              <div class="input-wrap">
                <svg lucideUserRound width="17" height="17"></svg>
                <input
                  type="text"
                  name="name"
                  [(ngModel)]="name"
                  required
                  maxlength="80"
                  autocomplete="name"
                  placeholder="Awesome Akokayo">
              </div>
            </label>

            <label>
              Email address
              <div class="input-wrap">
                <svg lucideMail width="17" height="17"></svg>
                <input
                  type="email"
                  name="email"
                  [(ngModel)]="email"
                  required
                  email
                  autocomplete="email"
                  placeholder="you@example.com">
              </div>
            </label>

            <label>
              Password
              <div class="input-wrap">
                <svg lucideLockKeyhole width="17" height="17"></svg>
                <input
                  type="password"
                  name="password"
                  [(ngModel)]="password"
                  required
                  minlength="8"
                  autocomplete="new-password"
                  placeholder="At least 8 characters">
              </div>
            </label>

            <label>
              Confirm password
              <div class="input-wrap">
                <svg lucideLockKeyhole width="17" height="17"></svg>
                <input
                  type="password"
                  name="confirmPassword"
                  [(ngModel)]="confirmPassword"
                  required
                  minlength="8"
                  autocomplete="new-password"
                  placeholder="Repeat your password">
              </div>
            </label>

            <div class="error" *ngIf="error">{{ error }}</div>

            <button class="submit-btn" type="submit" [disabled]="loading || !form.valid || password !== confirmPassword">
              <span>{{ loading ? 'Creating account...' : 'Create account' }}</span>
              <svg lucideArrowRight width="17" height="17"></svg>
            </button>
          </form>

          <p class="switch">Already have an account? <a routerLink="/login">Sign in</a></p>
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
    .brand-copy{max-width:390px;margin:auto 0}.eyebrow{font-size:10px;font-weight:800;letter-spacing:.16em;color:#929a9b}.brand-copy .eyebrow{color:#f4b860}.brand-copy h1{font-size:clamp(36px,4vw,55px);line-height:1.02;letter-spacing:-.045em;margin:15px 0}.brand-copy em{color:#f4d6cc;font-style:normal}.brand-copy p{max-width:350px;color:#c2c7c8;font-size:14px;line-height:1.7;margin:0}
    .brand-footer{display:flex;gap:8px;color:#899293;font-size:10px}
    .auth-content{display:grid;place-items:center;padding:30px}
    .auth-card{width:min(440px,100%);background:#fff;border:1px solid #e7e3e0;border-radius:18px;padding:32px 34px;box-shadow:0 18px 55px rgba(50,55,59,.07)}
    .card-heading{margin-bottom:24px}.card-heading h2{font-size:25px;letter-spacing:-.035em;margin:8px 0 6px}.card-heading p{color:#8a9293;font-size:12px;margin:0;line-height:1.6}
    form{display:grid;gap:14px}label{display:grid;gap:7px;color:#596162;font-size:11px;font-weight:800}.input-wrap{display:flex;align-items:center;gap:9px;border:1px solid #ddd9d6;border-radius:10px;padding:0 12px;background:#fff;transition:.18s}.input-wrap:focus-within{border-color:#f4b860;box-shadow:0 0 0 3px rgba(244,184,96,.14)}.input-wrap svg{color:#919899;flex:none}.input-wrap input{border:0;outline:0;width:100%;padding:11px 0;background:transparent;color:#32373b;font-size:12px}
    .error{padding:10px 11px;border-radius:9px;background:#fae1e4;color:#b53140;font-size:11px;line-height:1.45}
    .submit-btn{border:0;border-radius:10px;background:#c83e4d;color:#fff;padding:13px 15px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:12px;font-weight:800;box-shadow:0 8px 20px rgba(200,62,77,.17);transition:.18s}.submit-btn:hover:not(:disabled){transform:translateY(-1px);filter:brightness(.96)}.submit-btn:disabled{opacity:.5;cursor:not-allowed}
    .switch{text-align:center;color:#8b9394;font-size:11px;margin:21px 0 0}.switch a{color:#c83e4d;font-weight:800;text-decoration:none}.switch a:hover{text-decoration:underline}
    @media(max-width:760px){.auth-page{grid-template-columns:1fr}.auth-brand-panel{min-height:auto;padding:28px 24px}.brand-copy{margin:52px 0 28px}.brand-copy h1{font-size:36px}.brand-footer{display:none}.auth-content{padding:24px}.auth-card{padding:26px}}
  `]
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error = '';

  submit(): void {
    if (
      !this.name.trim() ||
      !this.email.trim() ||
      !this.password ||
      this.password !== this.confirmPassword ||
      this.loading
    ) return;

    this.loading = true;
    this.error = '';

    this.auth.register(this.name, this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: error => {
        this.loading = false;
        this.error = error?.error?.message || 'Could not create your account. Please try again.';
      }
    });
  }
}
