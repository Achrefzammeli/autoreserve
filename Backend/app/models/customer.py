from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.database.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String, nullable=False)

    cin = Column(String, unique=True, nullable=False)

    phone = Column(String, nullable=False)

    email = Column(String, nullable=True)

    address = Column(String, nullable=True)

    notes = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)