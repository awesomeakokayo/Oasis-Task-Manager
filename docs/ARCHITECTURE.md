# Architecture

## System overview

Oasis Task Manager is a three-layer local/full-stack application:

```text
┌──────────────────────────────────────┐
│ Angular 20                            │
│ Login / Register / Dashboard / UI    │
└──────────────────┬───────────────────┘
                   │ HTTP + JWT
                   ▼
┌──────────────────────────────────────┐
│ Spring Boot 3.5.5                     │
│ Spring Security → Controllers       │
│ → Repositories → JPA/Hibernate       │
└──────────────────┬───────────────────┘
                   │ JDBC
                   ▼
┌──────────────────────────────────────┐
│ PostgreSQL                            │
│ users + tasks                         │
└──────────────────────────────────────┘
```

## Frontend request flow

```text
main.ts
  ↓
AppComponent
  ↓
Router
  ├── /login
  ├── /register
  └── /dashboard
          ↓ authGuard
      DashboardComponent
          ↓
      AuthInterceptor
          ↓
      HTTP request + Bearer JWT
```

## Authentication flow

```text
Login/Register
  ↓
AuthService
  ↓
POST /api/auth/login|register
  ↓
AuthController
  ↓
AuthenticationManager / UserRepository
  ↓
BCrypt
  ↓
JwtService
  ↓
JWT
  ↓
localStorage
```

For later protected requests:

```text
Angular HTTP request
  ↓
AuthInterceptor
  ↓
Authorization: Bearer <JWT>
  ↓
JwtAuthenticationFilter
  ↓
JwtService validation
  ↓
DatabaseUserDetailsService
  ↓
Spring SecurityContext
  ↓
Controller
```

## Task authorization

Task access is always scoped to the authenticated User.

- List/search uses the authenticated user's ID.
- Create assigns the authenticated User to the new Task.
- Update uses `findByIdAndUserId(taskId, userId)`.
- Delete uses the same ownership-aware lookup.

The browser never chooses the task owner.

## Backend packages

| Package | Responsibility |
|---|---|
| `config` | Security, authentication provider, CORS |
| `controller` | REST API boundary |
| `exception` | API error translation |
| `model` | JPA entities |
| `repository` | Persistence/query operations |
| `security` | User lookup and JWT handling |

## Frontend files

| File | Responsibility |
|---|---|
| `app.routes.ts` | route definitions and guards |
| `auth.service.ts` | session, login, registration, profile |
| `auth.guard.ts` | protects dashboard |
| `guest.guard.ts` | redirects signed-in users away from auth pages |
| `auth.interceptor.ts` | adds JWT and handles 401 |
| `login.component.ts` | sign-in UI |
| `register.component.ts` | registration UI |
| `dashboard.component.ts` | current task dashboard and profile UI |

## Current architectural trade-off

The dashboard currently contains UI state and direct HttpClient calls. This keeps the assessment implementation compact, but it is the first area to refactor as the application grows.

Recommended target:

```text
features/auth/*
features/tasks/*
shared/*
core/services/*
```

and on the backend:

```text
Controller → Service → Repository
```

## Data model

```text
User 1 ───────────── * Task
```

A Task requires a User. `Task.user` is ignored in JSON responses so the lazy JPA relationship is not serialized back to Angular.

## Important design decisions

- Stateless JWT authentication instead of HTTP Basic.
- BCrypt for password hashing.
- Bearer tokens added centrally by an interceptor.
- Route guards protect the dashboard.
- Ownership checks happen server-side.
- Validation happens server-side even when Angular validates first.
- Local CORS accepts Angular development ports; production should use an allowlist.
