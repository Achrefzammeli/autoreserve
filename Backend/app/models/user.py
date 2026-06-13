from sqlalchemy import Column, Integer, String, Boolean
from app.database.database import Base

class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String, nullable=False)
    email         = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role          = Column(String, default="CLIENT")
    totp_secret   = Column(String, nullable=True)
    totp_enabled  = Column(Boolean, default=False)