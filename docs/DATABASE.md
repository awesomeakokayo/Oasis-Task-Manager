# Database Guide

## PostgreSQL

Docker Compose runs PostgreSQL 16:

```text
database: oasis_tasks
user: oasis
password: oasis
port: 5432
```

## ORM

Spring Data JPA + Hibernate maps the Java entities to PostgreSQL.

Development uses:

```properties
spring.jpa.hibernate.ddl-auto=update
```

Production should use versioned migrations such as Flyway or Liquibase.

## User

The User entity contains:

```text
id
name
email
password
tasks
```

Email is unique.

## Task

The Task entity contains:

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

The relationship is:

```text
users 1 ───────── * tasks
```

Each task has a required `ManyToOne` relationship to User.

## Ownership

The key authorization-aware query is:

```text
findByIdAndUserId(taskId, userId)
```

This prevents a user from updating/deleting a task solely by guessing its ID.

## Production recommendations

- Move credentials to environment variables.
- Use database migrations.
- Add indexes for frequent searches.
- Add explicit constraints for business rules.
- Use separate environments/databases.
- Back up production data.
