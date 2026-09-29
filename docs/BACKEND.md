# Backend Guide

## Runtime

- Java 21
- Spring Boot 3.5.5
- Spring Web
- Spring Security
- Spring Data JPA
- PostgreSQL driver
- Bean Validation
- JJWT dependencies

Entry point: `OasisTaskManagerApplication.java`.

## Configuration

`backend/src/main/resources/application.properties` configures:

- Port `8080`
- PostgreSQL connection
- Hibernate `ddl-auto=update`
- JWT placeholder properties

Use environment variables and migrations for production.

## SecurityConfig

Current rules:

```text
/api/auth/**  → permitted
everything else → authenticated
```

BCrypt is used as the password encoder. HTTP Basic is currently enabled.

## AuthController

`POST /api/auth/register`:

1. Validates name/email/password presence.
2. Requires an 8+ character password.
3. Lowercases email.
4. Rejects an existing email with 409.
5. Hashes the password using BCrypt.
6. Saves the User.
7. Returns 201.

## TaskController

Routes:

- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`

The authenticated principal's email is resolved to a User. Create assigns that User to the new task. Update/delete first require a task belonging to that User.

## Repositories

`UserRepository` provides `findByEmail`.

`TaskRepository` provides:

- `search(uid, q)`: current user's tasks, optional title search, due-date ascending.
- `findByIdAndUserId(id, userId)`: ownership-aware lookup.

## Entities

### User

`id, name, email, password, tasks`

Email is unique.

### Task

`id, title, description, dueDate, priority, completed, category, reminderAt, user`

Priority values: `LOW`, `MEDIUM`, `HIGH`.

## Recommended next steps

For a production/assessment-complete backend:

1. Add JWT service.
2. Add login endpoint.
3. Add JWT request filter.
4. Add DTOs and validation.
5. Add service layer for business logic.
6. Add global exception handling.
7. Add priority/status filters.
8. Add tests.
9. Move secrets to environment variables.
