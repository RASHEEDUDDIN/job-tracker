from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from ..database import get_db
from ..models import Application, User
from ..dependencies import get_current_user

router = APIRouter(prefix="/reminders", tags=["Reminders"])

@router.get("/stale")
def stale(db: Session = Depends(get_db),
          user: User = Depends(get_current_user)):
    cutoff = datetime.utcnow() - timedelta(days=7)
    apps = db.query(Application).filter(
        Application.user_id == user.id,
        Application.last_updated < cutoff,
        Application.status.in_(["applied", "interviewing", "assessment"])
    ).all()
    return {
        "stale_count": len(apps),
        "applications": [
            {
                "id": str(a.id),
                "company": a.company,
                "role": a.title,
                "status": a.status,
                "last_updated": a.last_updated,
                "days_since_update": (datetime.utcnow() - a.last_updated).days
            }
            for a in apps
        ]
    }