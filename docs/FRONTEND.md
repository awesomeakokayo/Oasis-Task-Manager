# Frontend Guide

## Runtime

Angular 20 + TypeScript + RxJS.

## Startup

From `frontend/`:

```powershell
npm install
npm start
```

Default URL:

```text
http://localhost:4200
```

Angular can use another port when 4200 is unavailable. The backend local CORS policy accounts for this.

## Application entry point

`src/main.ts` bootstraps:

- `AppComponent`
- Angular Router
- HttpClient
- `authInterceptor`

## Routing

Current routes:

```text
/           → /login
/login      → LoginComponent + guestGuard
/register   → RegisterComponent + guestGuard
/dashboard  → DashboardComponent + authGuard
*           → /login
```

This is intentional. A logged-out browser cannot enter the dashboard.

## Authentication files

### AuthService

Owns:

- register
- login
- profile lookup/update
- logout
- session persistence
- token expiry check

Session key:

```text
oasis_session
```

### authGuard

Checks `AuthService.isAuthenticated()`. Missing/expired sessions redirect to `/login`.

### guestGuard

Prevents authenticated users from seeing login/register unnecessarily.

### authInterceptor

Adds the bearer token to requests to the backend and redirects to login after a 401.

## Login flow

```text
LoginComponent
  ↓
AuthService.login()
  ↓
POST /api/auth/login
  ↓
JWT returned
  ↓
localStorage
  ↓
/dashboard
```

## Registration flow

```text
RegisterComponent
  ↓
password + confirm password check
  ↓
AuthService.register()
  ↓
POST /api/auth/register
  ↓
JWT returned
  ↓
localStorage
  ↓
/dashboard
```

A successful registration therefore behaves as an automatic login.

## Dashboard

`dashboard.component.ts` currently handles:

- task retrieval
- title search
- view switching
- category filtering
- high-priority filtering
- sorting
- create/edit/delete
- complete/reopen
- profile view/update
- logout
- toast notifications
- responsive navigation/modal behavior

The dashboard is intentionally user-aware; the greeting and profile name come from the authenticated session.

## Task UI

Task fields exposed by the form:

- title
- description
- priority
- category
- due date
- reminder

The dashboard also presents:

- total task count
- due-today count
- completed count
- completion progress

## UI conventions

Current visual language:

```text
Gunmetal     #32373b
Iron grey    #4a5859
Almond silk  #f4d6cc
Honey bronze #f4b860
Blushed brick#c83e4d
```

Lucide icons are used through `@lucide/angular`.

## Known frontend limitations

The current dashboard is the largest component in the frontend. A scalable refactor should move:

- task HTTP calls → TaskService
- task list → TaskListComponent
- task form/modal → TaskEditorComponent
- profile modal → ProfileComponent
- shared visual primitives → shared components

Use environment configuration for API URLs before production deployment.

There is currently no automated Angular test suite.
