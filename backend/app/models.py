from sqlalchemy import Column, String, Text, Date, Boolean, Enum, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    applications = relationship("Application", back_populates="owner")

class Application(Base):
    __tablename__ = "applications"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    jsearch_job_id = Column(String(100))
    title = Column(String(150), nullable=False)
    company = Column(String(150), nullable=False)
    company_logo = Column(String(500))
    location = Column(String(150))
    job_type = Column(String(50))
    job_url = Column(String(500))
    is_remote = Column(Boolean, default=False)
    description = Column(Text)
    salary_string = Column(String(100))
    salary_period = Column(String(20))
    posted_at = Column(DateTime)
    status = Column(
        Enum("saved","applied","interviewing","assessment",
             "offer","rejected","withdrawn", name="app_status"),
        default="saved"
    )
    notes = Column(Text)
    applied_date = Column(Date)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    owner = relationship("User", back_populates="applications")