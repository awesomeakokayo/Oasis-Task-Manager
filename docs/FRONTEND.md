# Frontend Guide

## Runtime

Angular 20 + TypeScript + RxJS.

Bootstrap begins in `src/main.ts`, which loads the standalone `AppComponent`.

## Routing

`app.routes.ts` currently maps:

```text
/ → DashboardComponent
```

## Dashboard

`dashboard.component.ts` currently handles:

- loading tasks
- title search
- creating tasks
- saving task changes
- marking tasks complete
- deleting tasks
- rendering priority, description, due date and category

It imports `CommonModule` and `FormsModule` and uses `HttpClient`.

## API communication

The current component calls:

```text
http://localhost:8080/api/tasks
```

directly.

For a larger application, move this logic to:

```text
core/services/task.service.ts
```

and use typed interfaces instead of `any[]`.

## Recommended scalable structure

```text
src/app/
├── core/
│   ├── auth/
│   ├── guards/
│   ├── interceptors/
│   └── services/
├── shared/
│   ├── components/
│   └── models/
└── features/
    ├── auth/
    ├── dashboard/
    └── tasks/
```

## Future JWT flow

```text
Login
 → AuthService
 → /api/auth/login
 → JWT
 → token storage
 → HTTP interceptor
 → Authorization: Bearer <token>
```

## Frontend rules

- Use environment configuration for API URLs.
- Prefer typed models.
- Keep HTTP calls in services.
- Keep components focused on UI behavior.
- Handle loading, empty and error states.
- Never place production secrets in Angular code.
