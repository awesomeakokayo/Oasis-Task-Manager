# Oasis Task Manager

Full-stack task management application for the Oasis FullStack Developer Assessment.

## Product flow

```text
/ → Login → Register (new users) → Dashboard
                 ↓
        authenticated JWT session
                 ↓
       task CRUD + profile
```

Unauthenticated users cannot enter the dashboard. Authenticated sessions are persisted in the browser until logout or token expiry.

## Stack

- **Frontend:** Angular 20 + TypeScript + RxJS
- **Icons/UI:** `@lucide/angular`
- **Backend:** Spring Boot 3.5.5 + Java 21
- **API:** Spring MVC REST
- **Persistence:** Spring Data JPA / Hibernate
- **Database:** PostgreSQL
- **Security:** Spring Security + BCrypt + JWT
- **JWT:** JJWT 0.12.6
- **Local infrastructure:** Docker Compose

## Repository structure

```text
Oasis-Task-Manager/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/oasis/taskmanager/
│       ├── config/
│       ├── controller/
│       ├── exception/
│       ├── model/
│       ├── repository/
│       └── security/
├── frontend/
│   ├── angular.json
│   ├── package.json
│   └── src/app/
│       ├── app.routes.ts
│       ├── auth.service.ts
│       ├── auth.guard.ts
│       ├── guest.guard.ts
│       ├── auth.interceptor.ts
│       ├── login.component.ts
│       ├── register.component.ts
│       └── dashboard.component.ts
├── docs/
└── docker-compose.yml
```

## Features

### Authentication

- registration with name, email and 8+ character password
- BCrypt password hashing
- JWT login
- protected Angular routes
- automatic Bearer token injection
- token expiry handling
- logout
- profile name/email update
- password visibility controls

### Task management

- create tasks
- edit tasks
- delete tasks
- complete/reopen tasks
- title search
- Today, Upcoming and Completed views
- high-priority filter
- due-date, priority and title sorting
- task categories
- reminder timestamp
- per-user task ownership

## Run locally

### 1. Start PostgreSQL

```bash
docker compose up -d
```

Default development connection:

```text
Host: localhost
Port: 5432
Database: oasis_tasks
User: oasis
Password: oasis
```

### 2. Start Spring Boot

Windows:

```powershell
cd backend
mvn spring-boot:run
```

or:

```powershell
.\mvnw.cmd spring-boot:run
```

API:

```text
http://localhost:8080
```

### 3. Start Angular

In another terminal:

```powershell
cd frontend
npm install
npm start
```

UI:

```text
http://localhost:4200
```

Angular can choose another local port if 4200 is busy; the backend CORS configuration allows local development ports.

## Authentication architecture

```text
Angular Login/Register
        ↓
AuthService
        ↓
POST /api/auth/login or /register
        ↓
AuthController
        ↓
AuthenticationManager
        ↓
DatabaseUserDetailsService
        ↓
PostgreSQL User
        ↓
BCrypt verification
        ↓
JwtService
        ↓
JWT returned to browser
        ↓
localStorage
        ↓
AuthInterceptor
        ↓
Authorization: Bearer <JWT>
        ↓
JwtAuthenticationFilter
        ↓
Spring SecurityContext
        ↓
Protected Controller
```

Task ownership is derived from the authenticated principal rather than from client-supplied user IDs.

## API

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

See [docs/API.md](docs/API.md).

## Documentation

Start here for a full engineering handoff:

- [Implementation / Engineering Handoff](docs/IMPLEMENTATION.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Backend](docs/BACKEND.md)
- [Frontend](docs/FRONTEND.md)
- [API](docs/API.md)
- [Database](docs/DATABASE.md)
- [Security](docs/SECURITY.md)
- [Development](docs/DEVELOPMENT.md)

## Current status

### Implemented

- [x] Angular frontend
- [x] Spring Boot backend
- [x] PostgreSQL persistence
- [x] User registration
- [x] User login
- [x] JWT authentication
- [x] Protected dashboard routing
- [x] Authenticated task CRUD
- [x] Per-user task ownership
- [x] Validation and API error responses
- [x] Profile view/update
- [x] Search
- [x] Categories
- [x] Reminder timestamp
- [x] Filtering/sorting UI
- [x] Password visibility toggles

### Engineering backlog

- [ ] Extract dashboard HTTP/business logic into dedicated Angular services/components
- [ ] Add backend service layer
- [ ] Introduce request/response DTOs
- [ ] Add Flyway/Liquibase migrations
- [ ] Add automated frontend/backend tests
- [ ] Add production HTTPS, secrets and restrictive CORS configuration
- [ ] Add real reminder/notification delivery
- [ ] Add rate limiting/audit logging
- [ ] Confirm `Oasisdevcloud` collaborator requirement

These are known improvements, not hidden assumptions. The implementation document explains what is currently implemented and why.

Repository: https://github.com/awesomeakokayo/Oasis-Task-Manager
