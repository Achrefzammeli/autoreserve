from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class BookingCreate(BaseModel):
    vehicle_id: int
    start_date: datetime
    end_date: datetime


class BookingOut(BaseModel):
    id: int
    user_id: int
    vehicle_id: int
    start_date: datetime
    end_date: datetime
    total_price: float
    status: str

    class Config:
        from_attributes = True


class BookingAdminOut(BaseModel):
    id: int
    user_id: int
    vehicle_id: int
    start_date: datetime
    end_date: datetime
    total_price: float
    status: str
    # enriched fields (joined manually in the endpoint)
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    vehicle_brand: Optional[str] = None
    vehicle_model: Optional[str] = None

    class Config:
        from_attributes = True


class BookingStatusUpdate(BaseModel):
    status: str  # CONFIRMED / CANCELLED / PENDING