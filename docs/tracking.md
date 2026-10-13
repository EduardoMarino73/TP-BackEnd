# Tracking of features, bugs and issues

> 📄 **Shared file:** an identical copy lives in [cineweb-frontend](https://github.com/liamlucca/cineweb-frontend) and [TP-BackEnd](https://github.com/EduardoMarino73/TP-BackEnd), under `docs/`. If you change it, change both.

- **Frontend issues:** https://github.com/liamlucca/cineweb-frontend/issues
- **Backend issues:** https://github.com/EduardoMarino73/TP-BackEnd/issues

## Feature status

Every feature needs both the frontend and the backend. The dates come from the frontend's git
history (`liam` branch); see [progress.md](progress.md).

| Feature | Proposal requirement | Status | Done in |
|---|---|---|---|
| Login, sign-up and routes protected by role | User CRUD, login | ✅ | 2026-06 and 2026-10-05 to 2026-10-09 |
| Profile: view and edit | User CRUD | ✅ | 2026-10-09 |
| Activate and deactivate accounts, create administrators | User CRUD, Administrator CRUD | ✅ | 2026-10-09 |
| Upload, watch, edit and delete movies (logical delete) | Audiovisual CRUD | ✅ | 2026-04 to 2026-08 and 2026-10 |
| Series with seasons and episodes: create, edit and delete | Audiovisual CRUD | ✅ | 2026-10-07 to 2026-10-12 |
| Thumbnail and duration read in the browser | Voluntary scope | ✅ | 2026-10-12 |
| Report reasons catalog | Report Type CRUD | ✅ | 2026-10-12 |
| Report a video (reason + details) | Report CRUD | ✅ | 2026-06 and 2026-10-12 |
| List of reports with filters and detail | List + detail 2, use case "Look up a report's data" | ✅ | 2026-10-12 |
| Appeal, withdraw an appeal and resolve it | Appeal CRUD, voluntary scope | ✅ | 2026-10-09 to 2026-10-12 |
| "Reports about my content" | Voluntary scope | ✅ | 2026-10-12 |
| Search by title, type and category, with detail | List + detail 1 | ✅ | 2026-06 and 2026-10-09 |
| "Like" / "Dislike" | Use case "Rate with Like / Dislike" | ✅ | 2026-10-09 |
| "Watch later" | Use case "Add audiovisual content to Watch later" | ✅ | 2026-10-12 |

## Known issues and future work

| Item | Type | Delivery |
|---|---|---|
| Appeal history with verdict changes (sketch C): the backend endpoint is missing | feature | approval |
| End-to-end test | task | approval |
| Filter by director (the backend has no such field) | feature | not scheduled |
| The series pages do not check that the season belongs to the series in the URL | bug | not scheduled |

More technical detail in the frontend's manual (`docs/MANUAL.md` in
[cineweb-frontend](https://github.com/liamlucca/cineweb-frontend), section 4.9).
