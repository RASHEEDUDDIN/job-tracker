from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from ..database import get_db
from ..models import Application, User
from ..schemas import ApplicationSave, ApplicationUpdate, ApplicationResponse
from ..dependencies import get_current_user

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.get("/", response_model=List[ApplicationResponse])
def get_all(status: Optional[str] = None, db: Session = Depends(get_db),
            user: User = Depends(get_current_user)):
    q = db.query(Application).filter(Application.user_id == user.id)
    if status:
        q = q.filter(Application.status == status)
    return q.order_by(Application.created_at.desc()).all()

@router.post("/", response_model=ApplicationResponse, status_code=201)
def save_job(data: ApplicationSave, db: Session = Depends(get_db),
             user: User = Depends(get_current_user)):
    existing = db.query(Application).filter(
        Application.user_id == user.id,
        Application.jsearch_job_id == data.jsearch_job_id
    ).first()
    if existing:
        raise HTTPException(400, "Job already saved to tracker")
    app = Application(**data.dict(), user_id=user.id)
    db.add(app); db.commit(); db.refresh(app)
    return app

@router.patch("/{app_id}", response_model=ApplicationResponse)
def update(app_id: UUID, data: ApplicationUpdate,
           db: Session = Depends(get_db),
           user: User = Depends(get_current_user)):
    app = db.query(Application).filter(
        Application.id == app_id,
        Application.user_id == user.id
    ).first()
    if not app:
        raise HTTPException(404, "Application not found")
    for k, v in data.dict(exclude_none=True).items():
        setattr(app, k, v)
    db.commit(); db.refresh(app)
    return app

@router.delete("/{app_id}", status_code=204)
def delete(app_id: UUID, db: Session = Depends(get_db),
           user: User = Depends(get_current_user)):
    app = db.query(Application).filter(
        Application.id == app_id,
        Application.user_id == user.id
    ).first()
    if not app:
        raise HTTPException(404, "Application not found")
    db.delete(app); db.commit()