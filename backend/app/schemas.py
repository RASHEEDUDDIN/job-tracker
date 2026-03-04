from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_name: str

class ApplyOption(BaseModel):
    publisher: str
    apply_link: str

class ApplicationSave(BaseModel):
    jsearch_job_id: str
    title: str
    company: str
    company_logo: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    job_url: Optional[str] = None
    is_remote: Optional[bool] = False
    description: Optional[str] = None
    salary_string: Optional[str] = None
    salary_period: Optional[str] = None
    posted_at: Optional[datetime] = None

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    applied_date: Optional[date] = None

class ApplicationResponse(BaseModel):
    id: UUID
    jsearch_job_id: Optional[str]
    title: str
    company: str
    company_logo: Optional[str]
    location: Optional[str]
    job_url: Optional[str]
    is_remote: Optional[bool]
    status: str
    notes: Optional[str]
    applied_date: Optional[date]
    salary_string: Optional[str]
    posted_at: Optional[datetime]
    last_updated: datetime
    created_at: datetime

    class Config:
        from_attributes = True