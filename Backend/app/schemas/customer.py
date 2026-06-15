from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CustomerCreate(BaseModel):
    full_name: str
    cin: str
    phone: str
    email: str | None = None
    address: str | None = None
    notes: str | None = None


class CustomerUpdate(BaseModel):
    full_name: str
    cin: str
    phone: str
    email: str | None = None
    address: str | None = None
    notes: str | None = None


class CustomerOut(BaseModel):
    id: int
    full_name: str
    cin: str
    phone: str
    email: str | None
    address: str | None
    notes: str | None
    created_at: datetime

    class Config:
        from_attributes = True

class CustomerAdminOut(BaseModel):

    id: int

    full_name: str
    cin: str
    phone: str

    email: Optional[str] = None
    address: Optional[str] = None

    bookings_count: int
    total_revenue: float

    last_booking: Optional[datetime] = None

    class Config:
        from_attributes = True