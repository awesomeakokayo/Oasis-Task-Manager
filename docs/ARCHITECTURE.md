# Architecture

## System Layers

```text
┌──────────────────────────┐
│ Angular 20 Frontend      │
│ App → Router → Dashboard │
└────────────┬─────────────┘
             │ HTTP
             ▼
┌──────────────────────────┐
│ Spring Boot REST API     │
│ Security → Controllers   │
│ → Repositories → JPA     │
└────────────┬─────────────┘
             │ JDBC/JPA
             ▼
┌──────────────────────────┐
│ PostgreSQL 16            │
└──────────────────────────┘
```

## Backend request flow

```text
HTTP request
 → Spring Security
 → Controller
 → authenticated user lookup
 → Repository
 → Hibernate/JPA
 → PostgreSQL
 → JSON response
 → Angular
```

Task update/delete requests use `findByIdAndUserId(taskId, userId)`, so task ownership is part of the database lookup rather than being trusted from the browser.

## Backend packages

- `config`: Spring Security configuration.
- `controller`: HTTP/API boundary.
- `model`: JPA entities.
- `repository`: Spring Data JPA persistence/query layer.

## Frontend flow

```text
main.ts
 → AppComponent
 → Router
 → DashboardComponent
 → HttpClient
 → REST API
```

The current dashboard owns task state and API calls. As the application grows, HTTP calls should move into dedicated Angular services.

## Data relationship

```text
User 1 ─────────── * Task
```

A task is required to have an owner. The authenticated principal is resolved to a User before task persistence.

## Extension rule

New features should cross the layers deliberately. For example, task filtering should become an API query parameter, then a repository query, rather than being implemented only in the browser.

## Current limitations

- HTTP Basic is active; JWT is not wired yet.
- No Angular auth service/interceptor is currently present.
- Dashboard uses direct HttpClient calls.
- Search currently covers title text and due-date ordering.
- No automated test suite is currently present.
