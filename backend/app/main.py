from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import auth, jobs, applications, stats, reminders

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Job Application Tracker API",
    description="Search jobs, track applications, monitor your pipeline",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://your-app.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(stats.router)
app.include_router(reminders.router)

@app.get("/")
def root():
    return {"message": "Job Tracker API running ✅"}