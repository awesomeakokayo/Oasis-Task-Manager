# API Reference

Base URL:

```text
http://localhost:8080
```

## Authentication

### Register

```http
POST /api/auth/register
Content-Type: application/json
```

Request:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```

Success:

```json
{
  "token": "<JWT>",
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

Status: `201 Created`.

### Login

```http
POST /api/auth/login
Content-Type: application/json
```

Request:

```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

Success:

```json
{
  "token": "<JWT>",
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

Invalid credentials: `401 Unauthorized`.

### Current profile

```http
GET /api/auth/me
Authorization: Bearer <JWT>
```

Response:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

### Update profile

```http
PUT /api/auth/me
Authorization: Bearer <JWT>
Content-Type: application/json
```

Request:

```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com"
}
```

The response contains a new JWT because the email may have changed.

## Tasks

All task endpoints below require:

```http
Authorization: Bearer <JWT>
```

### List/search

```http
GET /api/tasks
GET /api/tasks?q=meeting
```

Current query behavior:

- scoped to authenticated user
- optional title search
- ordered by due date ascending

### Create

```http
POST /api/tasks
Content-Type: application/json
```

Request:

```json
{
  "title": "Prepare assessment",
  "description": "Finish documentation",
  "dueDate": "2026-10-02",
  "priority": "HIGH",
  "completed": false,
  "category": "Work",
  "reminderAt": "2026-10-01T18:00:00"
}
```

The backend assigns the authenticated user.

### Update

```http
PUT /api/tasks/15
Content-Type: application/json
```

The same task fields can be supplied. Ownership is checked on the server.

### Delete

```http
DELETE /api/tasks/15
```

Ownership is checked before deletion.

## Task representation

| Field | Type | Required | Notes |
|---|---|---|---|
| id | number | server | identifier |
| title | string | yes | max 120 |
| description | string | no | max 4000 |
| dueDate | date | no | ISO date |
| priority | enum | no | LOW/MEDIUM/HIGH |
| completed | boolean | no | defaults false |
| category | string | no | optional |
| reminderAt | datetime | no | optional |
| user | internal | server | omitted from JSON |

## Error shape

Common errors are returned as:

```json
{
  "message": "Human-readable error"
}
```

Typical statuses:

| Status | Meaning |
|---:|---|
| 200 | successful request |
| 201 | created |
| 204 | deleted |
| 400 | validation/bad request |
| 401 | unauthenticated/invalid credentials |
| 409 | duplicate/conflicting data |

## Security rule

Never add a `userId` field to client task requests as an authorization mechanism. The backend derives ownership from the authenticated JWT principal.
