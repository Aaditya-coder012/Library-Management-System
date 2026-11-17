# MANIT Central Library — Management System (Full Stack)

A full-stack rebuild of the library management system, with a real Express + SQLite
API behind the dashboard instead of static mock tables.

**Stack**
- **Backend:** Node.js, Express, better-sqlite3 (file-based SQL database, no external DB server needed)
- **Frontend:** React 18 + Vite, React Router, Tailwind CSS, Recharts
- **Design:** a reading-room "ledger" aesthetic — parchment background, brass/rust/moss accents,
  Fraunces display serif + mono accession numbers — rather than a generic SaaS dashboard look.

## Features

- **Dashboard** — live totals, recent activity, and most-issued books (30-day window)
- **Book Catalogue** — add/search/filter/remove books, genre + availability filters, copy tracking
- **Members** — register/search/filter/remove members (Student/Faculty/Staff), active loan counts
- **Issue / Return** — issue a book to a member by ID, return by accession number, automatic
  14-day due dates and ₹5/day late fines calculated server-side
- **Fines** — outstanding and paid fine ledger, mark-as-paid action
- **Reports & Analytics** — genre distribution and member-type pie charts, 7-day issue/return
  bar chart, and a circulation history table, all computed live from the database

## Project structure

```
library-management-system/
├── backend/           Express API + SQLite database
│   ├── server.js
│   ├── db.js           schema
│   ├── constants.js     loan period / fine rate / genre lists
│   ├── seed.js          sample data generator
│   └── routes/
└── frontend/           React + Vite app
    └── src/
        ├── pages/        Dashboard, Books, Members, Transactions, Fines, Reports
        └── components/
```

## Running it locally

You'll need **Node.js 18+** installed.

### 1. Backend (API + database)

```bash
cd backend
npm install
npm run seed     # populates library.db with sample books/members/loans (optional but recommended)
npm start         # starts the API on http://localhost:4000
```

### 2. Frontend (in a second terminal)

```bash
cd frontend
npm install
npm run dev       # starts the app on http://localhost:5173
```

Open **http://localhost:5173** — the frontend dev server proxies `/api/*` requests to
the backend on port 4000, so no extra configuration is needed.

To reset the data at any point, just re-run `npm run seed` in `backend/` (this wipes and
reseeds `library.db`).

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/books` | list books (`?genre=&status=&q=`) |
| POST | `/api/books` | add a book |
| PUT / DELETE | `/api/books/:id` | update / remove a book |
| GET | `/api/members` | list members (`?type=&q=`) |
| POST | `/api/members` | register a member |
| DELETE | `/api/members/:id` | remove a member |
| GET | `/api/transactions` | list loans (`?status=Issued`) |
| POST | `/api/transactions/issue` | issue a book `{ member_code, accession_no }` |
| POST | `/api/transactions/return` | return a book `{ accession_no }` |
| POST | `/api/transactions/:id/pay-fine` | mark a fine as paid |
| GET | `/api/dashboard/stats` | dashboard totals + recent activity + popular books |
| GET | `/api/dashboard/analytics` | genre/member distribution + 7-day history |
| GET | `/api/dashboard/fines` | full fine ledger |

## Business rules

- Loan period: **14 days** from issue date
- Late fine: **₹5/day** past the due date, calculated live for active loans and finalized on return
- A book can't be issued if no copies are available, and a member can't hold two copies of the
  same title at once
- Deleting a book or member with an active loan is blocked to keep the ledger consistent

## Notes on deployment

This repo is set up for local development. To deploy for real use you'd want to:
- Swap SQLite for a hosted Postgres/MySQL instance if you need multiple app servers
- Add authentication (the original demo and this rebuild are open, admin-style tools)
- Point `frontend`'s API base URL at your deployed backend and build with `npm run build`,
  then serve the `dist/` folder from any static host (Netlify, Vercel, etc.) or from Express itself
