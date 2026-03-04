import httpx, os
from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime, timezone
from ..dependencies import get_current_user
from ..models import User

router = APIRouter(prefix="/jobs", tags=["Jobs"])

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
JSEARCH_HOST = os.getenv("RAPIDAPI_JSEARCH_HOST", "jsearch.p.rapidapi.com")
HEADERS = {
    "x-rapidapi-key": RAPIDAPI_KEY,
    "x-rapidapi-host": JSEARCH_HOST
}

ANNOTATION_KEYWORDS = [
    "ai training", "rlhf", "data annotation", "model evaluation",
    "llm evaluation", "ai evaluation", "data labeling", "content moderation"
]

def hours_since_posted(utc_string: str) -> float:
    try:
        posted = datetime.fromisoformat(utc_string.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        return (now - posted).total_seconds() / 3600
    except:
        return 999

def is_annotation_job(title: str, description: str) -> bool:
    text = (title + " " + description).lower()
    return any(kw in text for kw in ANNOTATION_KEYWORDS)

def get_salary_display(job: dict) -> str:
    if job.get("job_salary_string"):
        return job["job_salary_string"]
    min_s = job.get("job_min_salary")
    max_s = job.get("job_max_salary")
    period = job.get("job_salary_period", "")
    period_label = "/yr" if period == "YEAR" else "/hr" if period == "HOUR" else ""
    if min_s and max_s:
        return f"${int(min_s):,} - ${int(max_s):,}{period_label}"
    if max_s:
        return f"Up to ${int(max_s):,}{period_label}"
    if min_s:
        return f"From ${int(min_s):,}{period_label}"
    return None

@router.get("/search")
async def search_jobs(
    keyword: str = Query(..., description="e.g. Python Developer"),
    location: str = Query(default="Toronto, Ontario, Canada"),
    max_hours: int = Query(default=15, description="Max hours since posted"),
    remote_only: bool = Query(default=False),
    exclude_annotation: bool = Query(default=True,
        description="Filter out AI annotation/data labeling jobs"),
    current_user: User = Depends(get_current_user)
):
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            "https://jsearch.p.rapidapi.com/search",
            headers=HEADERS,
            params={
                "query": f"{keyword} in {location}",
                "page": "1",
                "num_pages": "1",
                "date_posted": "today",
                "remote_jobs_only": "true" if remote_only else "false"
            }
        )

    if response.status_code != 200:
        raise HTTPException(500, f"JSearch API error: {response.status_code}")

    jobs = response.json().get("data", [])
    results = []

    for job in jobs:
        title = job.get("job_title", "")
        description = job.get("job_description", "")
        utc_time = job.get("job_posted_at_datetime_utc")
        hours_ago = hours_since_posted(utc_time) if utc_time else 999
        is_recent = hours_ago <= max_hours

        if exclude_annotation and is_annotation_job(title, description):
            continue

        apply_opts = [
            {"publisher": opt.get("publisher"), "apply_link": opt.get("apply_link")}
            for opt in job.get("apply_options", [])
        ]

        results.append({
            "id": job.get("job_id"),
            "title": title,
            "company": job.get("employer_name"),
            "company_logo": job.get("employer_logo"),
            "location": job.get("job_location"),
            "job_type": job.get("job_employment_type"),
            "is_remote": job.get("job_is_remote", False),
            "apply_link": job.get("job_apply_link"),
            "apply_options": apply_opts,
            "description": description[:3000],
            "posted_human": job.get("job_posted_at"),
            "posted_utc": utc_time,
            "hours_ago": round(hours_ago, 1),
            "salary_string": get_salary_display(job),
            "salary_period": job.get("job_salary_period"),
            "benefits": job.get("job_benefits_strings", []),
            "is_recent": is_recent
        })

    results.sort(key=lambda x: x.get("hours_ago", 999))
    recent_count = sum(1 for r in results if r["is_recent"])

    return {
        "total": len(results),
        "recent_count": recent_count,
        "message": f"{recent_count} jobs posted within {max_hours} hours",
        "jobs": results
    }