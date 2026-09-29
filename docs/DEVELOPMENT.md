# Development Guide

## Prerequisites

- Git
- Java 21
- Maven/Maven Wrapper
- Node.js + npm
- Docker

## Start database

```bash
docker compose up -d
docker compose ps
```

## Start backend

```bash
cd backend
./mvnw spring-boot:run
```

Windows:

```text
mvnw.cmd spring-boot:run
```

## Start frontend

```bash
cd frontend
npm install
npm start
```

## Ports

| Service | Port |
|---|---:|
| Angular | 4200 |
| Spring Boot | 8080 |
| PostgreSQL | 5432 |

## Debugging checklist

If tasks fail to load:

1. Check PostgreSQL.
2. Check Spring Boot startup logs.
3. Confirm port 8080.
4. Inspect browser network requests.
5. Inspect `/api/tasks` status.
6. Confirm the authenticated principal resolves to a User.
7. Check repository ownership queries.

## Change workflow

Backend:

```text
model → repository → service/business logic → controller → API docs
```

Frontend:

```text
model/type → service → component → template → styles
```

## Verification

```bash
cd backend
./mvnw test
```

```bash
cd frontend
npm run build
```

## Commit style

Use focused commits such as:

```text
feat: add task filtering
fix: prevent cross-user task update
docs: document authentication flow
refactor: move task logic into service
test: cover task ownership
```

Avoid mixing unrelated changes in one commit.
