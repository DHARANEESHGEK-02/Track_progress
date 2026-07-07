# Student Registrar System (Enhanced)

A full-stack student records system with a dashboard, a searchable/sortable/paginated
student register, and a real day-by-day **attendance register** — built with
**React**, a **REST API** (Node.js/Express), and **MongoDB**.

This is version 2: a significant upgrade from a basic CRUD form, styled around
the idea of a school registrar's ledger book rather than a generic admin template.

---

## 1. What's new vs. the basic version

| Area | Before | Now |
|---|---|---|
| UI | Single-page form + flat table | Sidebar navigation, dashboard + register pages |
| Design | Generic light theme | Ledger/registrar aesthetic (serif headings, monospace data, ink/paper palette) |
| Attendance | One static percentage field | Real day-by-day attendance history, with a 14-day register grid you can click to mark |
| Data views | Just a list | Dashboard with stat cards + charts (enrollment by class, grade distribution) |
| List | All records at once | Search, filter by status, sort, and server-side pagination |
| Editing | Inline form only | Modal for add/edit, slide-in detail drawer per student |
| Demo data | None | `npm run seed` populates 5 sample students with attendance history |

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Hooks), Axios, Recharts (charts) |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| API style | REST (JSON over HTTP) |

---

## 3. Folder Structure

```
student-tracking-v2/
├── backend/
│   ├── config/db.js                 # MongoDB connection
│   ├── models/Student.js            # Schema + attendance sub-documents + virtual %
│   ├── controllers/studentController.js  # CRUD + pagination/sort/filter + stats + attendance
│   ├── routes/studentRoutes.js      # URL → controller mapping
│   ├── utils/seed.js                # Demo data generator
│   ├── server.js                    # App entry point
│   └── .env.example
│
└── frontend/
    ├── public/index.html            # Loads Source Serif 4 / Inter / IBM Plex Mono
    └── src/
        ├── api/studentApi.js        # All backend calls (CRUD, attendance, stats)
        ├── components/
        │   ├── Sidebar.jsx          # Left navigation
        │   ├── Dashboard.jsx        # Stat cards + bar/pie charts
        │   ├── StudentsPage.jsx     # Search, filter, sort, pagination, table
        │   ├── StudentFormModal.jsx # Add / edit modal
        │   └── StudentDetailDrawer.jsx  # Full record + attendance register grid
        ├── App.js                   # Page switcher (Dashboard ↔ Register)
        └── App.css                  # Design tokens + all styling
```

---

## 4. Design Direction (for context, in case it comes up)

The system is themed as a **registrar's ledger**, not a generic dashboard template:

- **Typography** — Source Serif 4 for headings (the authority of an official record), Inter for UI text and forms, IBM Plex Mono for anything numeric (roll numbers, stats, dates, percentages) so data reads like a tabulated ledger.
- **Color** — warm paper background (`#FAF8F3`), near-black ink for the sidebar and headings, and an oxblood red (`#7A2E2E`) accent — evoking a teacher's red pen rather than a generic SaaS blue.
- **Signature element** — the **attendance register grid**: a 14-day grid of cells per student that you click to mark Present / Late / Absent, styled like a physical roll-call sheet rather than a single number.

---

## 5. How the Code Works (Data Flow)

```
React component (Dashboard / StudentsPage / Drawer)
        │  calls a function from api/studentApi.js
        ▼
Axios request (GET / POST / PUT / DELETE)
        ▼
server.js  →  studentRoutes.js  →  studentController.js
        │
        ▼
Student.js (Mongoose model — validation + attendance % virtual)
        │
        ▼
MongoDB
        │
        ◄── JSON response flows back, React re-renders
```

### Backend, piece by piece

- **`models/Student.js`** — beyond basic fields, this holds `attendanceHistory`: an array of `{ date, status }` entries — one per day a teacher marks attendance. A **virtual field** `attendancePercentage` is computed on the fly: if real attendance entries exist, it calculates from them; otherwise it falls back to a manually-set `baselineAttendance`. This means the percentage is always derived from real data once you start tracking it, not just typed in.
- **`controllers/studentController.js`**:
  - `getStudents` — supports `?search=`, `?status=`, `?sortBy=`, `?order=`, `?page=`, `?limit=` all at once, and returns `total`/`totalPages` so the frontend can paginate properly.
  - `markAttendance` — upserts a single day's entry (`PUT /api/students/:id/attendance`). If that date already has a record, it overwrites the status instead of duplicating it.
  - `getStats` — a dashboard aggregation endpoint (`GET /api/students/stats/summary`) that returns totals, active/inactive counts, average attendance, and per-class/per-grade breakdowns used by the charts.
- **`routes/studentRoutes.js`** — note that `/stats/summary` is declared *before* `/:id` in the file. This matters: Express matches routes top-to-bottom, so if `/:id` came first, a request to `/stats/summary` would be mistakenly treated as `getStudentById` with `id = "stats"`.
- **`utils/seed.js`** — a standalone script (`npm run seed`) that wipes the collection and inserts 5 realistic sample students with a week of attendance history each, so the dashboard has real numbers to show immediately.

### Frontend, piece by piece

- **`App.js`** — just a page switcher. Holds one piece of state (`activePage`) and renders `Dashboard` or `StudentsPage` based on what's selected in the sidebar.
- **`components/Dashboard.jsx`** — fetches `/stats/summary` once on mount and renders 4 stat cards plus two Recharts visualizations: a bar chart (students per class) and a donut chart (grade distribution).
- **`components/StudentsPage.jsx`** — the main register view. Manages search term, status filter, sort order, and current page all as state, and re-fetches from the API whenever any of them change (debounced 350ms for search so it doesn't hit the API on every keystroke). Clicking a row opens the detail drawer.
- **`components/StudentFormModal.jsx`** — one shared modal for both creating and editing, depending on whether `editingStudent` is passed in.
- **`components/StudentDetailDrawer.jsx`** — shows the full record plus the **14-day attendance grid**. Each cell reflects that day's status (present/late/absent/no record), and three quick-action buttons let you mark today's attendance without opening the edit form.

---

## 5. API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/students` | List students. Query params: `search`, `status`, `sortBy`, `order`, `page`, `limit` |
| GET | `/api/students/:id` | Get one student |
| POST | `/api/students` | Create a student |
| PUT | `/api/students/:id` | Update a student |
| DELETE | `/api/students/:id` | Delete a student |
| PUT | `/api/students/:id/attendance` | Mark/overwrite attendance for one date. Body: `{ date: 'YYYY-MM-DD', status: 'present'|'absent'|'late' }` |
| GET | `/api/students/stats/summary` | Dashboard aggregates: totals, active/inactive, avg attendance, by-class, by-grade |

---

## 6. How to Run It Locally

### Prerequisites
- Node.js v16+
- MongoDB running locally, or a free MongoDB Atlas cluster

### Backend
```bash
cd backend
npm install
cp .env.example .env      # edit MONGO_URI if needed
npm run seed               # optional: populate 5 demo students
npm run dev                 # starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm start                   # starts on http://localhost:3000
```

Both servers need to run at the same time. The frontend talks to the backend at
`http://localhost:5000/api/students` (see `src/api/studentApi.js`).

---

## 7. If files show as read-only / can't be edited in VS Code

This happens when files extracted from a zip retain restrictive permission bits.
Fix it before opening the project:

**Mac/Linux:**
```bash
chmod -R u+rw student-tracking-v2
```

**Windows:** right-click the folder → Properties → uncheck "Read-only" → Apply to
all subfolders and files.

---

## 8. Interview Talking Points

- **Derived vs. stored data** — attendance percentage is a Mongoose *virtual*, computed from the actual history array rather than trusted as manual input once real data exists. Good example of not storing what you can calculate.
- **Route ordering matters in Express** — `/stats/summary` must be registered before `/:id` or it gets swallowed by the dynamic route.
- **Server-side pagination/filtering** instead of loading everything into the browser — scales to real class sizes.
- **Idempotent attendance marking** — `markAttendance` upserts by date instead of pushing duplicate entries, so re-marking a day just corrects it.
- **Possible extensions:** authentication/roles (admin vs teacher), CSV export/import, monthly attendance reports, email alerts on low attendance, subject-wise grades instead of one grade field.
