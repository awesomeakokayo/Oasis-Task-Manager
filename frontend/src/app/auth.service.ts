import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthUser {
  name: string;
  email: string;
}

export interface AuthResponse extends AuthUser {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly api = 'http://localhost:8080/api/auth';
  private readonly storageKey = 'oasis_session';

  private session: AuthResponse | null = this.readSession();

  get token(): string | null {
    return this.session?.token ?? null;
  }

  get user(): AuthUser | null {
    if (!this.session) return null;
    return { name: this.session.name, email: this.session.email };
  }

  isAuthenticated(): boolean {
    if (!this.session?.token) return false;

    try {
      const payload = JSON.parse(atob(this.session.token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 <= Date.now()) {
        this.logout();
        return false;
      }
    } catch {
      this.logout();
      return false;
    }

    return true;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.api + '/login', {
      email: email.trim().toLowerCase(),
      password
    }).pipe(tap(response => this.saveSession(response)));
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.api + '/register', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password
    }).pipe(tap(response => this.saveSession(response)));
  }

  me(): Observable<AuthUser> {
    return this.http.get<AuthUser>(this.api + '/me');
  }

  updateProfile(name: string, email: string): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(this.api + '/me', {
      name: name.trim(),
      email: email.trim().toLowerCase()
    }).pipe(tap(response => this.saveSession(response)));
  }

  logout(): void {
    this.session = null;
    localStorage.removeItem(this.storageKey);
  }

  private saveSession(response: AuthResponse): void {
    this.session = response;
    localStorage.setItem(this.storageKey, JSON.stringify(response));
  }

  private readSession(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AuthResponse;
      return parsed?.token && parsed?.email && parsed?.name ? parsed : null;
    } catch {
      return null;
    }
  }
}
