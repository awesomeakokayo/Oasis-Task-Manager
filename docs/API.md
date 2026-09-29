# API Reference

Local base URL: `http://localhost:8080`

## Register

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```

Success: `201 Created`.

Duplicate email: `409 Conflict`.

Invalid/missing required registration data: `400 Bad Request`.

## List/search tasks

```http
GET /api/tasks?q=meeting
```

Current behavior:

- results are scoped to the authenticated user
- `q` is optional
- `q` searches titles
- results are ordered by due date ascending

## Create

```http
POST /api/tasks
Content-Type: application/json
```

Example:

```json
{
  "title": "Prepare assessment",
  "description": "Finish documentation",
  "priority": "HIGH",
  "completed": false,
  "category": "Work"
}
```

The backend assigns the owner from the authenticated principal.

## Update

```http
PUT /api/tasks/15
Content-Type: application/json
```

The backend looks up the task by both ID and authenticated user ID before changing it.

## Delete

```http
DELETE /api/tasks/15
```

The same ownership check is applied before deletion.

## Task fields

| Field | Type | Meaning |
|---|---|---|
| id | number | identifier |
| title | string | task title |
| description | string | details |
| dueDate | date | optional deadline |
| priority | enum | LOW/MEDIUM/HIGH |
| completed | boolean | completion state |
| category | string | optional category |
| reminderAt | datetime | optional reminder |
| user | User | owner |

## Authentication note

Spring Security HTTP Basic is currently active. JJWT is present as a dependency, but JWT login/filtering is not currently implemented.

