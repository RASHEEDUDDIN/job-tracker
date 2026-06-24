import httpx, os
from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime, timezone
from typing import Optional
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

EXPERIENCE_KEYWORDS = {
    "entry":  ["entry level", "junior", "associate", "0-1 years", "new grad", "graduate"],
    "mid":    ["mid level", "mid-level", "2-4 years", "3+ years", "intermediate"],
    "senior": ["senior", "sr.", "lead", "principal", "staff", "5+ years", "7+ years"],
}

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

def matches_experience(title: str, description: str, level: str) -> bool:
    if level == "any":
        return True
    text = (title + " " + description).lower()
    keywords = EXPERIENCE_KEYWORDS.get(level, [])
    return any(kw in text for kw in keywords)

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
    max_hours: int = Query(default=24, description="Max hours since posted"),
    remote_only: bool = Query(default=False),
    exclude_annotation: bool = Query(default=True),
    employment_type: Optional[str] = Query(default=None, description="FULLTIME, PARTTIME, CONTRACTOR"),
    date_posted: str = Query(default="today", description="today, 3days, week, month"),
    experience_level: str = Query(default="any", description="any, entry, mid, senior"),
    publisher: Optional[str] = Query(default=None, description="Filter by publisher e.g. LinkedIn"),
    page: int = Query(default=1, description="Page number"),
    current_user: User = Depends(get_current_user)
):
    # Build query — append experience level hint if needed
    query = keyword
    if experience_level == "entry":
        query += " entry level"
    elif experience_level == "senior":
        query += " senior"
    elif experience_level == "mid":
        query += " mid level"

    params = {
        "query": f"{query} in {location}",
        "page": str(page),
        "num_pages": "1",
        "date_posted": date_posted,
        "remote_jobs_only": "true" if remote_only else "false"
    }

    if employment_type:
        params["employment_types"] = employment_type

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            "https://jsearch.p.rapidapi.com/search",
            headers=HEADERS,
            params=params
        )

    if response.status_code != 200:
        raise HTTPException(500, f"JSearch API error: {response.status_code}")

    jobs = response.json().get("data", [])
    results = []
    all_publishers = set()

    for job in jobs:
        title = job.get("job_title", "")
        description = job.get("job_description", "")
        utc_time = job.get("job_posted_at_datetime_utc")
        hours_ago = hours_since_posted(utc_time) if utc_time else 999
        is_recent = hours_ago <= max_hours

        # Collect all publishers for frontend filter
        for opt in job.get("apply_options", []):
            if opt.get("publisher"):
                all_publishers.add(opt["publisher"])

        # Filters
        if exclude_annotation and is_annotation_job(title, description):
            continue
        if experience_level != "any" and not matches_experience(title, description, experience_level):
            continue

        apply_opts = [
            {"publisher": opt.get("publisher"), "apply_link": opt.get("apply_link")}
            for opt in job.get("apply_options", [])
        ]

        # Publisher filter — only include jobs that have a listing on selected publisher
        if publisher:
            publishers_in_job = [o["publisher"] for o in apply_opts]
            if publisher not in publishers_in_job:
                continue

        job_type_raw = job.get("job_employment_type", "")
        job_type_display = job.get("job_employment_type_text") or job_type_raw

        results.append({
            "id": job.get("job_id"),
            "title": title,
            "company": job.get("employer_name"),
            "company_logo": job.get("employer_logo"),
            "location": job.get("job_location"),
            "job_type": job_type_display,
            "job_type_raw": job_type_raw,
            "is_remote": job.get("job_is_remote", False),
            "apply_link": job.get("job_apply_link"),
            "apply_options": apply_opts,
            "description": description[:3000],
            "posted_human": job.get("job_posted_at") or job.get("job_posted_human_readable"),
            "posted_utc": utc_time,
            "hours_ago": round(hours_ago, 1),
            "salary_string": get_salary_display(job),
            "salary_period": job.get("job_salary_period"),
            "benefits": job.get("job_benefits_strings") or [],
            "is_recent": is_recent
        })

    results.sort(key=lambda x: x.get("hours_ago", 999))
    recent_count = sum(1 for r in results if r["is_recent"])

    return {
        "total": len(results),
        "recent_count": recent_count,
        "page": page,
        "message": f"{recent_count} jobs posted within {max_hours} hours",
        "available_publishers": sorted(list(all_publishers)),
        "jobs": results
    }