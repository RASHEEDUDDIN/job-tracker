from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Application, User
from ..dependencies import get_current_user

router = APIRouter(prefix="/stats", tags=["Stats"])

@router.get("/summary")
def summary(db: Session = Depends(get_db),
            user: User = Depends(get_current_user)):
    total = db.query(Application).filter(Application.user_id == user.id).count()
    if total == 0:
        return {"total_saved": 0, "message": "No applications yet"}

    by_status = db.query(Application.status, func.count(Application.id))\
        .filter(Application.user_id == user.id)\
        .group_by(Application.status).all()
    status_map = {s: c for s, c in by_status}

    applied = sum(v for k, v in status_map.items() if k != "saved")
    responded = sum(v for k, v in status_map.items()
                    if k in ["interviewing", "assessment", "offer"])

    return {
        "total_saved": total,
        "total_applied": applied,
        "by_status": status_map,
        "response_rate": f"{round((responded/applied)*100,1)}%" if applied else "0%",
        "offer_rate": f"{round((status_map.get('offer',0)/applied)*100,1)}%" if applied else "0%"
    }

@router.get("/weekly")
def weekly(db: Session = Depends(get_db),
           user: User = Depends(get_current_user)):
    results = db.query(
        func.date_trunc("week", Application.created_at).label("week"),
        func.count(Application.id).label("count")
    ).filter(Application.user_id == user.id)\
     .group_by("week").order_by("week").all()
    return [{"week": str(r.week.date()), "count": r.count} for r in results]