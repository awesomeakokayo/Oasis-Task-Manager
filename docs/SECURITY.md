# Security Guide

## Security model

The browser is treated as untrusted.

Authentication is stateless JWT-based:

```text
email + password
    ↓
Spring AuthenticationManager
    ↓
PostgreSQL User
    ↓
BCrypt verification
    ↓
JWT
    ↓
Angular localStorage
    ↓
Bearer token on protected requests
```

## Password storage

Passwords are hashed using BCrypt before persistence.

Raw passwords are not stored in PostgreSQL.

## Authentication endpoints

Public:

```text
POST /api/auth/register
POST /api/auth/login
```

Protected:

```text
GET/PUT /api/auth/me
all /api/tasks endpoints
```

## JWT validation

`JwtAuthenticationFilter` validates:

- token signature
- token subject/email
- token expiration

A valid token creates the Spring Security authenticated principal.

## Task authorization

Authorization is based on ownership.

For example:

```text
PUT /api/tasks/42
        ↓
authenticated user ID = 7
        ↓
findByIdAndUserId(42, 7)
        ↓
update only when both match
```

This prevents a user from changing another user's task merely by knowing its ID.

## CORS

Development CORS accepts local:

```text
http://localhost:<port>
http://127.0.0.1:<port>
```

This is intentionally broader for local Angular development. Production should replace this with exact trusted frontend origins.

## CSRF

CSRF is disabled because the current API uses stateless Bearer-token authentication rather than browser cookies.

Revisit this architecture if authentication changes to cookie-based sessions.

## Secrets

Do not use development defaults in production.

The JWT configuration supports:

```text
JWT_SECRET
```

Production should also move PostgreSQL credentials into deployment secrets/environment configuration.

## Current security backlog

- HTTPS everywhere in deployment
- exact production CORS allowlist
- secret management
- auth rate limiting
- account lockout/abuse protection
- audit/security logging
- automated security tests
- refresh-token/session strategy if long-lived sessions are required
- database migrations
- DTOs so entities are never accidentally exposed through API responses

## Important implementation note

`Task.user` is marked `@JsonIgnore` so the lazy User relationship is not serialized when a Task is returned. This avoids leaking user persistence structure and prevents lazy-relationship serialization failures.
