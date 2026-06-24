# Job Tracker

A full-stack web application for searching jobs and tracking your applications through the entire hiring pipeline.

## Overview

Job Tracker lets you search real job listings (powered by JSearch via RapidAPI), save them to a personal tracker, and monitor each application through a 7-stage pipeline — from saved to offer or rejection. An analytics dashboard shows your response rate, offer rate, and weekly activity trends.

## Features

- **Job Search** — Search globally with filters for location, experience level, job type, recency, and publisher (LinkedIn, Indeed, etc.)
- **Application Pipeline** — Track jobs through: `saved → applied → interviewing → assessment → offer / rejected / withdrawn`
- **Notes & Dates** — Attach interview notes and applied dates to each application
- **Stale Alerts** — Surface applications with no updates in 7+ days so you can follow up
- **Analytics Dashboard** — Pipeline summary stats and a weekly activity chart
- **Smart Filtering** — Optionally exclude annotation/data-labeling jobs; filter for remote-only roles

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, TailwindCSS |
| Backend | FastAPI, Python 3, SQLAlchemy 2, Pydantic |
| Database | PostgreSQL (Supabase) |
| Auth | JWT (python-jose), bcrypt |
| Job Data | JSearch API (RapidAPI) |

## Project Structure

```
job-tracker/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── models.py          # SQLAlchemy ORM models
│   │   ├── schemas.py         # Pydantic request/response schemas
│   │   ├── auth.py            # Password hashing & JWT creation
│   │   ├── database.py        # DB connection & session
│   │   ├── dependencies.py    # Auth dependency injection
│   │   └── routers/
│   │       ├── auth.py        # Register / login
│   │       ├── jobs.py        # Job search (JSearch integration)
│   │       ├── applications.py# CRUD for saved applications
│   │       ├── stats.py       # Analytics endpoints
│   │       └── reminders.py   # Stale application detection
│   ├── requirements.txt
│   └── Procfile               # Production deployment (Uvicorn)
│
└── frontend/
    ├── src/
    │   ├── pages/             # LoginPage, RegisterPage, SearchPage, TrackerPage, StatsPage
    │   ├── api/               # Axios wrappers (auth, jobs, applications)
    │   ├── components/        # Reusable UI components
    │   ├── context/           # AuthContext (JWT state)
    │   ├── types/             # TypeScript interfaces
    │   └── App.tsx            # Router & protected routes
    ├── package.json
    └── vite.config.ts
```

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- A PostgreSQL database (e.g., [Supabase](https://supabase.com) free tier)
- A [RapidAPI](https://rapidapi.com) account with the **JSearch** API subscribed

### Backend Setup

1. Create and activate a virtual environment:

   ```bash
   cd backend
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS / Linux
   source venv/bin/activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Create `backend/.env`:

   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   JWT_SECRET=your-secret-key-at-least-32-chars
   JWT_ALGORITHM=HS256
   JWT_EXPIRE_MINUTES=1440
   RAPIDAPI_KEY=your-rapidapi-key
   RAPIDAPI_JSEARCH_HOST=jsearch.p.rapidapi.com
   ```

4. Start the server:

   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   API docs are available at `http://localhost:8000/docs`.

### Frontend Setup

1. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Create `frontend/.env`:

   ```env
   VITE_API_URL=http://localhost:8000
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

   The app runs at `http://localhost:5173`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Get JWT token |
| GET | `/jobs/search` | Search jobs with filters |
| GET | `/applications` | List saved applications |
| POST | `/applications` | Save a job |
| PATCH | `/applications/{id}` | Update status, notes, or applied date |
| DELETE | `/applications/{id}` | Remove a job |
| GET | `/stats/summary` | Pipeline overview (totals, rates) |
| GET | `/stats/weekly` | Weekly activity for charting |
| GET | `/reminders/stale` | Applications needing follow-up |

## Deployment

**Backend** — The included `Procfile` targets Heroku-style platforms:
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Frontend** — Build a production bundle and deploy the `dist/` folder to any static host (Vercel, Netlify, etc.):
```bash
npm run build
```

Update the CORS origins in `backend/app/main.py` to include your production frontend URL.

## Security

- Passwords are hashed with bcrypt before storage — plaintext passwords are never persisted
- All API routes (except auth) require a valid JWT in the `Authorization: Bearer <token>` header
- Applications are filtered server-side by the authenticated user's ID — users cannot access each other's data
- `.env` files are excluded from version control via `.gitignore`
