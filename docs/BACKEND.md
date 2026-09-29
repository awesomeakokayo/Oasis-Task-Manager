# Backend Guide

## Runtime

- Java 21
- Spring Boot 3.5.5
- Spring Web
- Spring Security
- Spring Data JPA / Hibernate
- PostgreSQL
- Bean Validation
- JJWT 0.12.6

Entry point:

```text
backend/src/main/java/com/oasis/taskmanager/OasisTaskManagerApplication.java
```

## Backend startup

From `backend/`:

```powershell
mvn spring-boot:run
```

or:

```powershell
.\mvnw.cmd spring-boot:run
```

Default API:

```text
http://localhost:8080
```

## Configuration

`backend/src/main/resources/application.properties` contains the local PostgreSQL connection, JPA settings and JWT configuration.

JWT secret:

```properties
app.jwt.secret=${JWT_SECRET:development-default}
```

Use `JWT_SECRET` in real environments.

## SecurityConfig

The application is stateless.

```text
POST /api/auth/register → public
POST /api/auth/login    → public
OPTIONS /**             → public
everything else         → authenticated
```

CORS allows local Angular origins during development.

The JWT filter runs before `UsernamePasswordAuthenticationFilter`.

HTTP Basic and form login are disabled.

## DatabaseUserDetailsService

`DatabaseUserDetailsService` adapts the application's `UserRepository` to Spring Security's `UserDetailsService`.

Lookup:

```text
email → UserRepository.findByEmail()
      → Spring UserDetails
```

This is what allows `AuthenticationManager` to verify login credentials against PostgreSQL.

## JwtService

Responsibilities:

- generate JWT with email as subject
- set issued-at time
- set expiration
- sign token with configured HMAC key
- parse/verify signed tokens
- validate subject and expiration

## JwtAuthenticationFilter

For every request containing:

```http
Authorization: Bearer <token>
```

the filter:

1. extracts the token
2. extracts the email
3. loads the user
4. validates the token
5. creates an authenticated Spring Security token
6. places it in the SecurityContext

Invalid tokens are left unauthenticated and are rejected by the security rules.

## AuthController

### `POST /api/auth/register`

- validates request
- normalizes email
- checks duplicate email
- BCrypt-hashes password
- saves User
- immediately returns a JWT

### `POST /api/auth/login`

- normalizes email
- authenticates email/password through Spring Security
- loads User
- returns a fresh JWT

### `GET /api/auth/me`

Returns the authenticated user's name and email.

### `PUT /api/auth/me`

Updates name/email and returns a new JWT reflecting the current email.

## TaskController

### `GET /api/tasks`

Optional query parameter:

```text
?q=meeting
```

Results are scoped to the authenticated user and ordered by due date.

### `POST /api/tasks`

The backend assigns:

```text
task.user = authenticated user
```

The client cannot choose the owner.

### `PUT /api/tasks/{id}`

The task is first resolved with an ownership-aware lookup. Then task fields are updated.

### `DELETE /api/tasks/{id}`

The same ownership rule applies before deletion.

## Validation

Task fields:

- title: required, maximum 120 characters
- description: maximum 4000 characters
- priority: `LOW`, `MEDIUM`, `HIGH`

Registration fields:

- name: required, max 80
- email: valid email
- password: 8–100 characters

## Exception handling

`ApiExceptionHandler` translates common failures into predictable JSON responses:

```json
{"message":"Invalid email or password."}
```

Typical statuses:

- 400 validation error
- 401 invalid authentication
- 409 duplicate/conflicting data

## Current backend limitation

There is no service layer yet. Controllers call repositories directly. That is acceptable for the current assessment-sized implementation, but business logic should move into services before significant growth.

There are also no automated backend tests in the current implementation.
