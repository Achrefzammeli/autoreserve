from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from datetime import datetime

from app.database.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(
        Integer,
        ForeignKey("customers.id"),
        nullable=False
    )
    vehicle_id = Column(
        Integer,
        ForeignKey("vehicles.id"),
        nullable=False
    )

    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)

    total_price = Column(Float, nullable=False)

    status = Column(String, default="PENDING")
    # PENDING / CONFIRMED / CANCELLED

    created_at = Column(DateTime, default=datetime.utcnow)