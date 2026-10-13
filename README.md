# TP-BackEnd — CineWeb API

Backend of **CineWeb**, a platform where viewers upload, watch, rate and report movies and series,
and administrators moderate reports and appeals. DSW course project.

Express 5 + TypeScript + MySQL, with the MikroORM 6 ORM (entities mapped to the tables of
`init.sql`, accessed through repositories). Set `MYSQL_DEBUG=true` to log the SQL it runs. The frontend is
[cineweb-frontend](https://github.com/liamlucca/cineweb-frontend).

**Documentation** (proposal, PRs, progress minutes, tracking): [docs/](docs/README.md).

## Quick start

Requirements: Node.js 20+, pnpm and MySQL 8.

```bash
pnpm install
cp .env.example .env          # then fill in your MySQL user and password
mysql -u root -p < init.sql   # creates the che_netflix database
pnpm dev                      # http://localhost:3000
```

Every setting (port, allowed CORS origins, upload folder and size limits) is described in
`.env.example`.

**First administrator.** Public sign-up creates viewers only. Register an account and promote it
in MySQL:

```sql
UPDATE che_netflix.users SET role = 'administrator' WHERE email = 'admin@example.com';
```

**Existing database.** `init.sql` only creates what is missing (`CREATE ... IF NOT EXISTS`), so it
does not add new columns to tables created by an older version. Back up your data and recreate the
database (`DROP DATABASE che_netflix;`, then run `init.sql` again).

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Compiles and runs the server, restarting on every change. |
| `pnpm build` | Compiles TypeScript into `dist/`. |
| `pnpm start` | Runs the compiled server (`dist/index.js`). |

## What the API covers

- Accounts: sign-up (viewers), login with a 7-day bearer token, profile, administrators.
- Movies, series, seasons and episodes with video upload, thumbnails, duration and logical delete.
  Only the uploader can change their content.
- Like / dislike reviews, and a "Watch later" list per viewer.
- Reports with a catalog of report types; three reports open a moderation case that the owner can
  appeal and an administrator decides.

Protected routes need `Authorization: Bearer <token>`. Errors are answered as JSON
(`{ "message": "..." }`) with the matching status code.

| Base path | Resource |
|---|---|
| `/api/users` | Sign-up, login, logout, own profile (`/me`) |
| `/api/viewers` | Viewer profile and the reports about their content (`/me`, `/me/reports`) |
| `/api/administrators` | Administrators, accounts and pending appeals |
| `/api/movie` | Movies |
| `/api/series`, `/api/seasons`, `/api/episodes` | Series, seasons and episodes |
| `/api/reviews` | Like / dislike |
| `/api/watch-later` | The viewer's "Watch later" list |
| `/api/report-types` | Catalog of report reasons |
| `/api/reports` | Reports and moderation cases |
| `/api/appeals` | Appeals |
| `/movies`, `/series`, `/thumbnails` | Uploaded videos and images |
