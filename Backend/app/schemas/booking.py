from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class BookingCreate(BaseModel):
    customer_id: int
    vehicle_id: int
    start_date: datetime
    end_date: datetime

class BookingOut(BaseModel):
    id: int
    customer_id: int
    vehicle_id: int
    start_date: datetime
    end_date: datetime
    total_price: float
    status: str

    class Config:
        from_attributes = True


class BookingAdminOut(BaseModel):
    id: int

    customer_id: int
    vehicle_id: int

    start_date: datetime
    end_date: datetime

    total_price: float
    status: str

    customer_name: str | None = None
    customer_cin: str | None = None
    customer_phone: str | None = None

    vehicle_brand: str | None = None
    vehicle_model: str | None = None

    class Config:
        from_attributes = True
class BookingStatusUpdate(BaseModel):
    status: str  # CONFIRMED / CANCELLED / PENDING