from sqlalchemy import Column, Integer, String, Float
from app.database.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id            = Column(Integer, primary_key=True, index=True)
    brand         = Column(String, nullable=False)
    model         = Column(String, nullable=False)
    price_per_day = Column(Float, nullable=False)
    status        = Column(String, default="AVAILABLE")
    image_url     = Column(String, nullable=True)
    specs         = Column(String, nullable=True)