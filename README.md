# TP-BackEnd

## User accounts

Run `init.sql` in MySQL to create the `users` and `user_sessions` tables along with the content schema. Public registration creates viewer accounts only. Promote the first administrator explicitly after registering the account:

```sql
UPDATE che_netflix.users SET role = 'administrator' WHERE email = 'admin@example.com';
```

### User API

- `POST /api/users/register`: accepts `{ "user_name", "first_name", "last_name", "email", "password" }` and creates a viewer.
- `POST /api/users/login`: accepts `{ "login": "email or username", "password" }` and returns a seven-day bearer token.
- `POST /api/users/logout`: ends the current session.
- `GET /api/users/me` and `PATCH /api/users/me`: read and update the signed-in account profile.
- `GET /api/viewers/me`: returns the signed-in viewer profile, reviews, and uploaded audiovisual count.
- `POST /api/reports`: reports a movie or series; accepts `{ "targetType": "movie", "targetId": 1, "reason": "..." }` (use `series` for a series).
- `POST /api/appeals`: content owner appeals a report; accepts `{ "reportId": 1, "description": "..." }`.
- `GET /api/administrators`: lists administrator accounts (administrator only).
- `POST /api/administrators`: creates an administrator account (administrator only).
- `PATCH /api/administrators/:id/active`: activates or deactivates an administrator (administrator only).
- `GET /api/administrators/users`: lists viewers and administrators (administrator only).
- `PATCH /api/administrators/users/:id/active`: activates or deactivates any account (administrator only).
- `GET /api/administrators/appeals`: lists pending appeals (administrator only).
- `GET /api/reports/:id`: views report details and the current report count (administrator only).
- `PATCH /api/administrators/appeals/:id`: resolves an appeal with `{ "decision": "approved|rejected" }` (administrator only).

Send `Authorization: Bearer <token>` to protected routes. The API never returns password hashes. Create the user schema in the database configured by `MYSQL_DATABASE` before starting the server.

The viewer profile returns uploaded movies and episodes, reviews, reports received, and appeals submitted against reports on their content. Each viewer may report an item once. The third report against one movie or series creates a moderation case that its owner can appeal. Administrators can inspect the case and individual report reasons at `GET /api/reports/:id`. Approving an appeal dismisses that case and keeps the content active. Rejecting an appeal upholds the case and suspends the content (`state = 'suspended'`). Administrators see pending cases through their `pendingAppeals` attribute.

If the database was initialized with an earlier version of this project, rerun the updated `init.sql` to create `content_reports`, `moderation_cases`, and `content_appeals`. The previous prototype tables named `complaints` and `appeals` are not used by this workflow.
