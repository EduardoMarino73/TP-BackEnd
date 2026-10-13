# Progress minutes

> 📄 **Shared file:** an identical copy lives in [cineweb-frontend](https://github.com/liamlucca/cineweb-frontend) and [TP-BackEnd](https://github.com/EduardoMarino73/TP-BackEnd), under `docs/`. If you change it, change both.

> **How it was made.** These progress minutes were reconstructed on 2026-10-13 **only from the git
> history**: the frontend's `liam` branch, the backend's branches
> ([TP-BackEnd](https://github.com/EduardoMarino73/TP-BackEnd): `main`, `Eduardo`, `Liam`,
> `Candela`) and the course repository fork. Anything that did not end up in a commit (tasks shared
> over chat, for example) is not listed here.

## Summary by member

The team has three members. Candela used two GitHub accounts: `Cande-R` and `Candy-Ram`.

| Git account | Member | Frontend (`liam`) | Backend (all branches) | Course fork (2026) |
|---|---|---|---|---|
| `Liam` / `Liam Lucca` | Lucca, Liam Santiago | 78 | 36 | 5 |
| `Cande-R`, `Candy-Ram` | Requelme, Candela M | 8 | 6 | 11 |
| `EduardoMarino73` | Marino, Eduardo | 2 | 29 | 9 |

Counts taken when these minutes were made (2026-10-13); they include merge commits.

## Progress by month

### April 2026

- **Proposal** (course fork, 04-08 and 04-09): `proposal.md` is written and revised (Candy-Ram,
  EduardoMarino73) and the members are added (Liam Lucca).
- **Frontend** (04-27 to 04-29, Liam): project created, basic structure, the video upload screen
  and a first design.
- **Backend** (04-27 and 04-29, EduardoMarino73): project with Express and Multer, server running
  and videos received from the frontend.

### May 2026

- **Frontend** (05-08 to 05-12, Liam): Flowbite is tried and replaced by DaisyUI on the landing
  page; first movies fetched from the backend.
- **Backend** (05-05 and 05-06, EduardoMarino73): listing of the movies and series stored in folders.
- **Course fork** (05-10, Liam Lucca): links to the repositories and a visible link to the proposal.

### June 2026

- **Frontend** (06-08 and 06-10, Liam): login screen (`AuthPage`) and search screen (`SearchPage`).
- **Frontend** (06-24, Cande-R): reports and report screens, merged with pull request #1
  (`Candela` branch).

### July 2026

- **Backend** (07-11 to 07-17, EduardoMarino73): full movie CRUD (findAll, findOne, create,
  update, delete).

### August 2026

- **Frontend** (08-17 to 08-21, Liam): adapted to the new backend, landing and video pages,
  player, upload progress bar, design and search bar fixes.
- **Frontend** (08-18, EduardoMarino73): order of `data` and `archivo` in uploads, so the backend
  builds the file path.
- **Frontend** (08-20, Cande-R): "My videos" screen connected to the backend, with delete and edit
  buttons.
- **Backend** (08-01 to 08-19, EduardoMarino73): move from MongoDB to MySQL, movie CRUD on the
  database, episodes and the building of file paths.
- **Backend** (08-17 to 08-21, Liam): CORS, `init.sql` and `.env.example`, video streaming and
  file path fixes.
- **Backend** (08-19 and 08-20, Cande-R): commits on the `Candela` branch (changes and merges with
  `main`).

### September 2026

- **Frontend** (09-16 and 09-18, Liam): code translated into English.
- **Backend** (09-18, Liam): code translated into English.

### October 2026 (up to 10-12)

- **Frontend** (Liam), from 10-05 to 10-12:
  - User system: types, session, authentication service (real and mock), context, routes
    protected by role, login, sign-up and logout against the backend.
  - Domain diagram, sketches and code manual in `docs/`.
  - One service per entity and friendly error handling; first unit tests (Vitest).
  - Series: seasons, episodes, three-step upload and editing from "My videos".
  - Reports with the reasons catalog, "Like" / "Dislike" reviews, profile with activity and
    appeals, "Watch later".
  - Administration: pending appeals, list and detail of reports with filters, report reasons CRUD
    and accounts.
  - Visual redesign (thumbnails, carousels, navbar, 404 page) and install instructions in the
    README.
- **Backend** (10-05 to 10-08, EduardoMarino73): series CRUD, audiovisual hierarchy for movies and
  episodes, reviews CRUD and the user system (viewer reports and appeals for administrators).
- **Backend** (10-05 and 10-06, Liam): merges of the `Eduardo` branch and configuration and file
  name fixes.
- **Backend** (10-06 and 10-07, Cande-R): merges of `main` into the `Candela` branch.
- **Backend** (10-12, Liam): token required to write content and reviews, errors as JSON, uploads
  with unique names, a size limit and a type check, logical delete, report reasons catalog, list of
  reports with filters, "Reports about my content", withdrawing appeals, "Watch later",
  thumbnails and duration.
- **Course fork** (10-06, Candy-Ram): `proposal.md` updated.

### October 13, 2026: persistence moved to an ORM

- **Why:** the course asks that the backend reach the database through a mapper (ORM/ODM). The
  Repository pattern alone is only accepted when the database has no mapper for JavaScript, and
  MySQL has several. Until then the backend used `mysql2` with hand-written SQL.
- **Decision:** MikroORM 6 (`@mikro-orm/core`, `@mikro-orm/mysql`), the ORM taught in the course.
  Version 7 needs Node 22.17 or later; the team uses Node 20.
- **What changed in the backend** (pull request #8, `Eduardo` branch, merged into `main`):
  - Each `*.entity.ts` class is now an ORM entity mapped to its table of `init.sql`. The schema did
    not change.
  - `Viewer` and `Administrator` extend `User` in the `users` table, told apart by `role`
    (single table inheritance), as in the domain diagram.
  - The repositories use the ORM's `EntityManager`; reports and appeals use its transactions with
    row locks, and the list of reports groups its reasons with the `QueryBuilder`.
  - Each request gets its own `EntityManager` (`RequestContext`).
  - `mysql2` is no longer a direct dependency; `MYSQL_DEBUG=true` logs the SQL the ORM runs.
- **Checks:** the old and the new backend answered the same sequence of API calls with the same
  JSON, so the frontend did not change. The only difference: the profile now returns every field
  of the viewer's episodes.
- **Documentation:** the backend README, `.env.example` and the proposal's technical note were
  updated.

Every change is detailed in the git history (`git log liam`).
