from pydantic import BaseModel


class VehicleCreate(BaseModel):
    brand: str
    model: str
    type: str
    price_per_day: float
    status: str = "AVAILABLE"
    image_url: str | None = None
    specs: str | None = None


class VehicleOut(BaseModel):
    id: int
    brand: str
    model: str
    type: str
    price_per_day: float
    status: str
    image_url: str | None
    specs: str | None

    class Config:
        from_attributes = True