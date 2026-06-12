from pydantic import BaseModel
from datetime import datetime


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