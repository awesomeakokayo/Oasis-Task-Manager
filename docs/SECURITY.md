# Security Guide

## Current boundary

The backend is the security authority. The browser is untrusted.

Current route policy:

```text
/api/auth/**       PUBLIC
all other routes  PROTECTED
```

## Passwords

Registration uses BCrypt:

```text
raw password → BCrypt → stored hash
```

The raw password is not persisted.

## Task authorization

For update/delete:

```text
authenticated user + task ID
        ↓
findByIdAndUserId()
        ↓
task is returned only when ownership matches
```

Do not replace this with a plain `findById` and client-side ownership check.

## CSRF

CSRF is disabled in the current REST API configuration. Revisit this if cookie-based browser sessions are introduced.

## Secrets

Current database credentials and JWT secret are development placeholders. They must not be reused in production.

Use environment variables/secret management for:

```text
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
APP_JWT_SECRET
```

## JWT status

JJWT dependencies and properties exist, but JWT is not currently connected to authentication.

A complete implementation needs:

1. login endpoint
2. credential verification
3. token creation
4. token validation
5. request filter
6. SecurityContext population
7. Angular Bearer interceptor
8. expiry handling

## Further hardening

- DTO validation
- global error responses without internal details
- rate limiting on auth endpoints
- restrictive CORS
- HTTPS
- audit logging
- security tests
