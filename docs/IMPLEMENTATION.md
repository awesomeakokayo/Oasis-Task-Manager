# Oasis Task Manager — Engineering Handoff

## 1. What this application is

Oasis Task Manager is a full-stack task management application built for the Oasis FullStack Developer Assessment.

The product requirement is:

- users register with name, email and password
- users log in with email and password
- authenticated users land on a dashboard
- users create, view, update, complete and delete tasks
- tasks support title, description, due date and priority
- task lists can be filtered/sorted in the dashboard
- each user's tasks belong only to that user
- user profile information can be viewed and updated
- optional features include categories, reminders and search

The implementation uses Angular for the browser application, Spring Boot for the API/security layer, and PostgreSQL for persistence.

---

## 2. Technology stack

| Layer | Technology |
|---|---|
| Frontend | Angular 20, TypeScript, RxJS |
| UI icons | `@lucide/angular` |
| Backend | Spring Boot 3.5.5 |
| Language | Java 21 |
| Security | Spring Security, BCrypt, JWT |
| Authentication token | JJWT 0.12.6 |
| Persistence | Spring Data JPA / Hibernate |
| Database | PostgreSQL |
| Local database | Docker Compose |

---

## 3. Repository structure

```text
Oasis-Task-Manager/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/oasis/taskmanager/
│       │   ├── OasisTaskManagerApplication.java
│       │   ├── config/
│       │   │   └── SecurityConfig.java
│       │   ├── controller/
│       │   │   ├── AuthController.java
│       │   │   └── TaskController.java
│       │   ├── exception/
│       │   │   └── ApiExceptionHandler.java
│       │   ├── model/
│       │   │   ├── User.java
│       │   │   └── Task.java
│       │   ├── repository/
│       │   │   ├── UserRepository.java
│       │   │   └── TaskRepository.java
│       │   └── security/
│       │       ├── DatabaseUserDetailsService.java
│       │       ├── JwtAuthenticationFilter.java
│       │       └── JwtService.java
│       └── resources/
│           └── application.properties
├── frontend/
│   ├── angular.json
│   ├── package.json
│   └── src/
│       ├── main.ts
│       └── app/
│           ├── app.component.ts
│           ├── app.routes.ts
│           ├── auth.guard.ts
│           ├── auth.interceptor.ts
│           ├── auth.service.ts
│           ├── dashboard.component.ts
│           ├── guest.guard.ts
│           ├── login.component.ts
│           └── register.component.ts
├── docs/
└── docker-compose.yml
```

---

## 4. How the application starts

There are three local processes:

### PostgreSQL

Start the local database first:

```bash
docker compose up -d
```

The development database is configured as:

```text
Host: localhost
Port: 5432
Database: oasis_tasks
User: oasis
Password: oasis
```

### Spring Boot backend

From the repository root:

**Windows:**

```powershell
cd backend
mvn spring-boot:run
```

or, when the Maven wrapper is available:

```powershell
.mvnw.cmd spring-boot:run
```

The API listens on:

```text
http://localhost:8080
```

### Angular frontend

In a second terminal:

```powershell
cd frontend
npm install
npm start
```

The browser normally opens at:

```text
http://localhost:4200
```

Angular may choose another local development port if 4200 is already occupied. The backend CORS policy intentionally allows local `localhost` and `127.0.0.1` development ports.

---

## 5. Configuration and secrets

Backend configuration lives in:

```text
backend/src/main/resources/application.properties
```

Important values:

```properties
spring.datasource.url=...
spring.datasource.username=...
spring.datasource.password=...
app.jwt.secret=${JWT_SECRET:development-default}
app.jwt.expiration-ms=86400000
```

The JWT secret is environment-overridable.

For production, set a strong secret through `JWT_SECRET` and do not keep the development fallback.

Database credentials should also be supplied through environment-specific configuration instead of committing production credentials.

---

## 6. Application boot flow

The Angular application starts at:

```text
frontend/src/main.ts
```

It bootstraps `AppComponent`, the router, HttpClient, and the authentication interceptor.

The router then evaluates:

```text
/           → /login
/login      → LoginComponent (guest only)
/register   → RegisterComponent (guest only)
/dashboard  → DashboardComponent (authenticated only)
```

The two route guards are deliberate:

- `guestGuard`: an authenticated user is redirected to `/dashboard`
- `authGuard`: an unauthenticated user is redirected to `/login`

This prevents the dashboard from being the first screen for a logged-out user.

---

## 7. Registration flow

The registration sequence is:

```text
RegisterComponent
    ↓
AuthService.register()
    ↓
POST /api/auth/register
    ↓
AuthController
    ↓
Validate name/email/password
    ↓
Check duplicate email
    ↓
BCrypt hash password
    ↓
Save User with JPA
    ↓
Create JWT
    ↓
Return token + name + email
    ↓
AuthService stores session in localStorage
    ↓
Navigate to /dashboard
```

Registration therefore logs the new user in immediately. The user does not have to register and then manually log in again.

### Registration validation

The backend requires:

- non-empty name
- valid email
- password of at least 8 characters
- unique email

Angular also prevents submission when the two password fields do not match.

---

## 8. Login flow

The login sequence is:

```text
LoginComponent
    ↓
AuthService.login()
    ↓
POST /api/auth/login
    ↓
AuthenticationManager
    ↓
DatabaseUserDetailsService
    ↓
UserRepository.findByEmail()
    ↓
BCrypt password verification
    ↓
JwtService.generateToken()
    ↓
Return token + user details
    ↓
AuthService stores session
    ↓
Navigate to /dashboard
```

The login form has a password visibility toggle.

---

## 9. Session persistence

The Angular session is kept in:

```text
localStorage["oasis_session"]
```

The stored value contains:

```json
{
  "token": "JWT...",
  "name": "User Name",
  "email": "user@example.com"
}
```

`AuthService.isAuthenticated()` also checks the JWT expiration time.

When a token expires or a protected API request returns 401:

```text
AuthInterceptor
    ↓
AuthService.logout()
    ↓
Navigate to /login
```

A new browser session can therefore be restored without asking the user to sign in again until the token expires or the user signs out.

---

## 10. How authenticated API requests work

The Angular interceptor automatically adds:

```http
Authorization: Bearer <JWT>
```

to API requests.

Backend processing is:

```text
HTTP request
    ↓
Cors handling
    ↓
JwtAuthenticationFilter
    ↓
extract email from JWT
    ↓
DatabaseUserDetailsService
    ↓
validate JWT
    ↓
populate Spring SecurityContext
    ↓
Controller
```

The browser never tells the backend which user owns a task. The backend gets the identity from the authenticated principal.

---

## 11. Task ownership and authorization

This is one of the most important security rules in the application.

### Create

`POST /api/tasks`

The backend ignores any browser-supplied owner and assigns the authenticated User entity to the new Task.

### Update

`PUT /api/tasks/{id}`

The repository lookup is:

```text
findByIdAndUserId(taskId, authenticatedUserId)
```

A user can therefore update only a task that belongs to them.

### Delete

The same ownership-aware lookup is used before deletion.

### List/search

`GET /api/tasks` is scoped to the authenticated user before the search query runs.

---

## 12. Task lifecycle

The main dashboard supports:

```text
Create
  ↓
List
  ↓
Edit
  ↓
Complete / reopen
  ↓
Delete
```

A task currently contains:

| Field | Purpose |
|---|---|
| id | database identifier |
| title | required task name |
| description | optional task details |
| dueDate | optional date |
| priority | LOW, MEDIUM, HIGH |
| completed | completion state |
| category | optional workspace/category label |
| reminderAt | optional reminder timestamp |
| user | owning User |

The dashboard also provides:

- title search
- Today view
- Upcoming view
- Completed view
- category view
- High-priority filter
- due date sorting
- priority sorting
- title sorting

---

## 13. Frontend responsibility by file

### `app.routes.ts`

Owns URL-to-component mapping and access guards.

### `auth.service.ts`

Owns login, registration, session storage, profile operations and logout.

### `auth.guard.ts`

Stops unauthenticated access to the dashboard.

### `guest.guard.ts`

Stops authenticated users from unnecessarily returning to login/register.

### `auth.interceptor.ts`

Adds JWT bearer credentials to API requests and handles 401 responses.

### `login.component.ts`

Owns the sign-in form and visual auth experience.

### `register.component.ts`

Owns account creation and client-side password confirmation.

### `dashboard.component.ts`

Currently owns dashboard presentation, task state, task API calls, filters, sorting, task editor, profile modal and toast feedback.

For a larger production codebase, this component should eventually be split into feature components and a dedicated task service.

---

## 14. Backend responsibility by file

### `SecurityConfig.java`

Defines:

- password encoder
- authentication provider
- authentication manager
- CORS policy
- stateless session policy
- public auth endpoints
- protected application endpoints
- JWT filter placement

### `DatabaseUserDetailsService.java`

Connects Spring Security's credential lookup to the PostgreSQL User table.

### `JwtService.java`

Creates and validates JWTs using the configured secret and expiration.

### `JwtAuthenticationFilter.java`

Reads the Bearer token from each request, validates it and populates Spring Security's authentication context.

### `AuthController.java`

Owns registration, login and profile API endpoints.

### `TaskController.java`

Owns task CRUD and applies authenticated-user ownership checks.

### `ApiExceptionHandler.java`

Converts common validation/auth/data errors into predictable JSON messages for the frontend.

### repositories

Repositories contain persistence queries and ownership-aware task lookups.

### models

JPA entities map application data to PostgreSQL.

---

## 15. API summary

### Public

```text
POST /api/auth/register
POST /api/auth/login
```

### Authenticated

```text
GET    /api/auth/me
PUT    /api/auth/me

GET    /api/tasks?q=<search>
POST   /api/tasks
PUT    /api/tasks/{id}
DELETE /api/tasks/{id}
```

Every protected endpoint expects a valid Bearer JWT.

---

## 16. Error handling

The backend exposes useful client-facing messages for:

- invalid credentials → 401
- invalid request fields → 400
- duplicate user/profile data → 409
- invalid task input → 400

The Angular forms surface these messages where appropriate.

When debugging an issue, always check both sides:

### Browser

Open DevTools → Network and inspect:

- request URL
- method
- status
- Authorization header
- response body

### Backend

Inspect the Spring Boot console for:

- startup failures
- database connection errors
- authentication exceptions
- validation exceptions
- JPA/SQL errors

---

## 17. What is implemented

### Core assessment requirements

- [x] Angular frontend
- [x] Spring Boot backend
- [x] PostgreSQL persistence
- [x] User registration
- [x] User login
- [x] JWT authentication
- [x] Protected routes
- [x] Authenticated task CRUD
- [x] Per-user task ownership
- [x] Task title
- [x] Task description
- [x] Due date
- [x] Priority
- [x] Completion status
- [x] Filtering and sorting UI
- [x] Search
- [x] User profile view/update

### Bonus features

- [x] Categories
- [x] Reminder timestamp field
- [x] Search

---

## 18. What is not fully production-ready

These are not reasons to rewrite the current application, but they are the main engineering backlog.

### Architecture

The dashboard contains too much UI + HTTP logic in one component. Extract:

```text
TaskService
Auth feature folder
Task editor component
Task list component
Profile component
Shared UI components
```

### Backend layering

The current backend goes:

```text
Controller → Repository
```

A production refactor should add:

```text
Controller → Service → Repository
```

This is especially useful for task ownership, business rules and transactional operations.

### DTOs

The API currently exposes JPA entities directly. Introduce request/response DTOs to control exactly what crosses the API boundary.

### Database migrations

Development uses Hibernate `ddl-auto=update`. Production should use Flyway or Liquibase.

### Tests

Add:

- authentication tests
- registration validation tests
- task ownership tests
- controller tests
- repository tests
- Angular component/service tests
- end-to-end login/task tests

### Production infrastructure

Still needed for a real deployment:

- HTTPS
- production CORS origins
- managed secrets
- production database
- backups
- rate limiting
- logging/monitoring
- notification/reminder delivery

---

## 19. Known development gotchas

### CORS

The frontend may run on `4200` or another local Angular port. The backend currently allows local development origins.

After changing backend security configuration, restart Spring Boot completely.

### Port 4200 already in use

Angular may select another available port. This is okay for local development because backend CORS accepts local development origins.

### Authentication appears broken

Check in this order:

1. Is PostgreSQL running?
2. Did Spring Boot start successfully?
3. Is Angular pointing at port 8080?
4. Is `oasis_session` present in localStorage?
5. Does the request contain a Bearer token?
6. Does the token still have time remaining?
7. Does the email still exist in PostgreSQL?

### Task request returns 401

The frontend is not authenticated or the JWT is missing/expired.

### Task request returns 500

Check the Spring Boot console first. Do not infer the cause from the browser message alone.

---

## 20. Recommended engineering workflow

When taking over this repository:

1. Pull the current `main` branch.
2. Start PostgreSQL.
3. Start Spring Boot and make sure startup succeeds.
4. Start Angular.
5. Register a fresh test account.
6. Confirm login/session persistence.
7. Create a task.
8. Edit and complete it.
9. Test filtering/search.
10. Test logout/login again.
11. Test that a second user cannot see the first user's tasks.
12. Run frontend build and backend tests before pushing changes.

Keep commits focused:

```text
feat: ...
fix: ...
refactor: ...
test: ...
docs: ...
```

---

## 21. Assessment handoff checklist

Before handing the repository to another engineer/reviewer:

- [ ] README and docs are current
- [ ] backend starts successfully
- [ ] frontend starts successfully
- [ ] PostgreSQL is reachable
- [ ] registration works
- [ ] login works
- [ ] logout works
- [ ] protected dashboard works
- [ ] task CRUD works
- [ ] task ownership is verified
- [ ] API validation works
- [ ] production secrets are not committed
- [ ] automated tests are present
- [ ] `Oasisdevcloud` has been added as a GitHub collaborator, if this assessment requirement is still outstanding

---

## 22. Change history / why things exist

The application evolved from a simple dashboard into a protected multi-user task manager.

Important implementation decisions:

- route guards were added because the dashboard must not be the entry point for unauthenticated users
- JWT was wired because task ownership depends on a trustworthy authenticated principal
- BCrypt is used so plaintext passwords are never stored
- the interceptor centralizes Bearer token handling instead of adding headers in every component
- ownership-aware repository lookups prevent users from modifying another user's task by guessing an ID
- `@JsonIgnore` on `Task.user` prevents the lazy User relationship from being serialized as part of task JSON
- explicit validation prevents malformed users/tasks from reaching persistence
- the UI uses Lucide Angular icons rather than manually drawn icon glyphs

This document should be updated whenever the authentication, data model, API contract or top-level frontend architecture changes.
