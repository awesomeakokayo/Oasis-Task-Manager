# Database Guide

## Local PostgreSQL

Docker Compose supplies the development PostgreSQL instance.

Default local connection:

```text
Host: localhost
Port: 5432
Database: oasis_tasks
User: oasis
Password: oasis
```

Start it:

```bash
docker compose up -d
```

## ORM

Spring Data JPA + Hibernate maps:

```text
User → users
Task → task table
```

Development currently uses:

```properties
spring.jpa.hibernate.ddl-auto=update
```

This is convenient for assessment development, not ideal for production schema management.

## User

Fields:

```text
id
name
email
password
tasks
```

Email is unique.

Passwords contain BCrypt hashes, not plaintext values.

## Task

Fields:

```text
id
title
description
dueDate
priority
completed
category
reminderAt
user
```

Relationship:

```text
User 1 ───────── * Task
```

Each Task requires an owner.

## Ownership query

The repository exposes:

```text
findByIdAndUserId(taskId, userId)
```

This is a key part of the security model.

## Search

The current repository query:

- limits results to one user
- optionally searches title text
- orders by due date ascending

Priority/status filtering currently happens in the dashboard for the loaded result set.

## Production migration plan

Move from Hibernate schema updates to Flyway or Liquibase.

Then add explicit migrations for:

- users
- tasks
- indexes
- constraints

Useful future indexes include:

```text
tasks(user_id)
tasks(user_id, due_date)
users(email)
```

## Data safety

Production should have:

- backups
- restore testing
- environment separation
- least-privilege database credentials
- monitoring for failed connections
