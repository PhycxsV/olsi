# Mock auth and admin-only Users module

This is a frontend-only mock auth flow.

## Mock accounts

- Admin account
  - email: admin@test.com
  - password: admin123
  - role: ADMIN

- Non-admin account
  - email: non-admin@test.com
  - password: user123
  - role: USER

## What was added

- Login page at `/login`
- Route protection for app modules
- Admin-only route for `/users`
- Users module hidden from non-admin in navigation

## Main files

- Auth service:
  - `src/app/core/services/auth.service.ts`

- Guards:
  - `src/app/core/guards/auth.guard.ts`
  - `src/app/core/guards/admin.guard.ts`

- Login module:
  - `src/app/login/login.module.ts`
  - `src/app/login/login.component.ts`
  - `src/app/login/login.component.html`

- Users module:
  - `src/app/users/users.module.ts`
  - `src/app/users/users.component.ts`

- App shell and routing integration:
  - `src/app/app-routing.module.ts`
  - `src/app/app.component.ts`
  - `src/app/app.component.html`

## Behavior

- If not logged in, protected routes redirect to login.
- If logged in as USER, Users module is hidden and `/users` is blocked.
- If logged in as ADMIN, Users module is visible and `/users` is accessible.
