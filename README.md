# Oasis Task Manager

Full-stack task management application for the Oasis developer assessment.

## Stack

- **Frontend:** Angular 20 + TypeScript + RxJS
- **Backend:** Spring Boot 3.5.5 + Java 21
- **API:** Spring MVC REST
- **Persistence:** Spring Data JPA / Hibernate
- **Database:** PostgreSQL 16
- **Security:** Spring Security + BCrypt + HTTP Basic
- **Local infrastructure:** Docker Compose
- **JWT:** JJWT dependency/configuration is present for the planned JWT flow, but JWT authentication is not currently wired into the request pipeline.

## Repository

```text
Oasis-Task-Manager/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/oasis/taskmanager/
│       ├── OasisTaskManagerApplication.java
│       ├── config/SecurityConfig.java
│       ├── controller/
│       │   ├── AuthController.java
│       │   └── TaskController.java
│       ├── model/
│       │   ├── User.java
│       │   └── Task.java
│       └── repository/
│           ├── UserRepository.java
│           └── TaskRepository.java
├── frontend/
│   ├── angular.json
│   ├── package.json
│   └── src/
│       ├── main.ts
│       └── app/
│           ├── app.component.ts
│           ├── app.routes.ts
│           └── dashboard.component.ts
├── docs/
│   ├── ARCHITECTURE.md
│   ├── BACKEND.md
│   ├── FRONTEND.md
│   ├── API.md
│   ├── DATABASE.md
│   ├── SECURITY.md
│   └── DEVELOPMENT.md
└── docker-compose.yml
```

## Architecture

```text
Angular UI
   │ HTTP
   ▼
Spring Boot REST API
   │
   ├── Controllers
   ├── Repositories
   └── JPA Entities
   │
   ▼
PostgreSQL
```

The frontend owns presentation and user interaction. The backend owns persistence, authentication boundaries and task ownership. PostgreSQL is the source of persisted application data.

## Current Features

- User registration
- BCrypt password hashing
- Protected task API
- Task CRUD
- Per-user task ownership checks
- Task title search
- Due-date ordering
- Priority
- Completion state
- Category
- Reminder timestamp
- PostgreSQL persistence
- Dockerized local PostgreSQL
- Angular dashboard

## Run Locally

### Database

```bash
docker compose up -d
```

Defaults:

```text
Host: localhost
Port: 5432
Database: oasis_tasks
User: oasis
Password: oasis
```

### Backend

Requires Java 21.

```bash
cd backend
./mvnw spring-boot:run
```

API: `http://localhost:8080`

### Frontend

Requires Node.js/npm.

```bash
cd frontend
npm install
npm start
```

UI: `http://localhost:4200`

## API

```text
POST   /api/auth/register
GET    /api/tasks?q=<search>
POST   /api/tasks
PUT    /api/tasks/{id}
DELETE /api/tasks/{id}
```

See [docs/API.md](docs/API.md).

## Engineering Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Backend](docs/BACKEND.md)
- [Frontend](docs/FRONTEND.md)
- [API](docs/API.md)
- [Database](docs/DATABASE.md)
- [Security](docs/SECURITY.md)
- [Development](docs/DEVELOPMENT.md)

## Important Implementation Status

This README documents the code that is actually present. The current authentication implementation uses Spring Security HTTP Basic. Although JJWT dependencies and JWT properties exist, there is no completed JWT login endpoint/filter or Angular Bearer-token interceptor yet.

Similarly, the current task query searches titles and orders by due date; it is not yet a full priority/status filter engine.

These points are intentionally explicit so an engineer can distinguish implemented behavior from planned extensions.

Repository: https://github.com/awesomeakokayo/Oasis-Task-Manager
