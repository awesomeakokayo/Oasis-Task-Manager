# Development Guide

## Prerequisites

- Git
- Java 21
- Maven
- Node.js + npm
- Docker

## 1. Get the repository

```bash
git clone https://github.com/awesomeakokayo/Oasis-Task-Manager.git
cd Oasis-Task-Manager
```

If Git reports `Could not resolve host: github.com`, the machine has a DNS/network problem rather than a Git repository problem. Verify:

```powershell
nslookup github.com
```

## 2. Start PostgreSQL

```bash
docker compose up -d
docker compose ps
```

Expected local database:

```text
localhost:5432
oasis_tasks
```

## 3. Start backend

```powershell
cd backend
mvn spring-boot:run
```

Windows Maven wrapper, when available:

```powershell
.\mvnw.cmd spring-boot:run
```

API:

```text
http://localhost:8080
```

The backend must show a successful Spring Boot startup before the browser is tested.

## 4. Start frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm start
```

Open:

```text
http://localhost:4200
```

## 5. First-use workflow

```text
Open application
    ↓
/login
    ↓
Create account
    ↓
POST /api/auth/register
    ↓
JWT stored locally
    ↓
/dashboard
    ↓
Create task
    ↓
POST /api/tasks with Bearer token
```

Returning users sign in with:

```text
POST /api/auth/login
```

## Ports

| Service | Default |
|---|---:|
| Angular | 4200 |
| Spring Boot | 8080 |
| PostgreSQL | 5432 |

Angular can use another port when 4200 is busy.

## Debugging order

### Backend will not start

Check the Spring Boot terminal first. Fix startup errors before debugging browser CORS.

### CORS error

1. Confirm Spring Boot is actually running.
2. Confirm frontend origin/port.
3. Confirm `SecurityConfig` CORS rules.
4. Restart Spring Boot after security changes.

### 401 on /api/tasks

Check:

- whether `oasis_session` exists
- whether the token is expired
- whether the browser request contains `Authorization: Bearer ...`
- whether the PostgreSQL user still exists

### 500 on /api/tasks

Inspect the Spring Boot stack trace. Do not rely only on the browser console.

### Registration says email exists

The registration endpoint is working and the email is already in the users table. Use login instead.

## Verification commands

Backend:

```bash
cd backend
mvn test
```

Frontend:

```bash
cd frontend
npm run build
```

These should be part of the handoff/release check even though the current repository does not yet have comprehensive automated tests.

## Change workflow

Backend:

```text
model
 ↓
repository
 ↓
service (recommended next)
 ↓
controller
 ↓
API docs
```

Frontend:

```text
model/type
 ↓
service
 ↓
component
 ↓
template/styles
```

## Recommended commit style

```text
feat: add task filtering
fix: prevent cross-user task update
refactor: extract task service
test: cover authentication
docs: update engineering handoff
```

Keep commits focused and do not mix unrelated changes.
