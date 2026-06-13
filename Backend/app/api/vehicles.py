import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.booking import Booking
from app.database.dependencies import get_db
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleOut
from app.core.dependencies import require_role

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

UPLOAD_DIR = "uploads/vehicles"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


def save_image(file: UploadFile) -> str:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, and WebP images are allowed.")
    ext      = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path     = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return f"/uploads/vehicles/{filename}"


# ── Create ────────────────────────────────────────────────────────────

@router.post("/", response_model=VehicleOut)
def create_vehicle(
    brand:         str        = Form(...),
    model:         str        = Form(...),
    price_per_day: float      = Form(...),
    status:        str        = Form("AVAILABLE"),
    specs:         str | None = Form(None),
    image:         UploadFile = File(None),
    db:            Session    = Depends(get_db),
    admin                     = Depends(require_role("ADMIN"))
):
    image_url = save_image(image) if image and image.filename else None

    vehicle = Vehicle(
        brand=brand,
        model=model,
        price_per_day=price_per_day,
        status=status,
        specs=specs,
        image_url=image_url,
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


# ── List ──────────────────────────────────────────────────────────────

@router.get("/", response_model=list[VehicleOut])
def get_vehicles(db: Session = Depends(get_db)):
    return db.query(Vehicle).all()


# ── Get one ───────────────────────────────────────────────────────────

@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@router.get("/available/", response_model=list[VehicleOut])
def get_available_vehicles(
    start_date: datetime,
    end_date: datetime,
    db: Session = Depends(get_db)
):

    booked_ids = db.query(
        Booking.vehicle_id
    ).filter(
        Booking.status != "CANCELLED",
        Booking.start_date <= end_date,
        Booking.end_date >= start_date
    )

    vehicles = db.query(Vehicle).filter(
        Vehicle.status == "AVAILABLE",
        ~Vehicle.id.in_(booked_ids)
    ).all()

    return vehicles
# ── Update ────────────────────────────────────────────────────────────

@router.put("/{vehicle_id}", response_model=VehicleOut)
def update_vehicle(
    vehicle_id:    int,
    brand:         str        = Form(...),
    model:         str        = Form(...),
    price_per_day: float      = Form(...),
    status:        str        = Form("AVAILABLE"),
    specs:         str | None = Form(None),
    image:         UploadFile = File(None),
    db:            Session    = Depends(get_db),
    admin                     = Depends(require_role("ADMIN"))
):
    db_vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    db_vehicle.brand         = brand
    db_vehicle.model         = model
    db_vehicle.price_per_day = price_per_day
    db_vehicle.status        = status
    db_vehicle.specs         = specs

    if image and image.filename:
        # Supprime l'ancienne image
        if db_vehicle.image_url:
            old_path = db_vehicle.image_url.lstrip("/")
            if os.path.exists(old_path):
                os.remove(old_path)
        db_vehicle.image_url = save_image(image)

    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle


# ── Delete ────────────────────────────────────────────────────────────

@router.delete("/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    db:         Session = Depends(get_db),
    admin               = Depends(require_role("ADMIN"))
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    # Supprime l'image du disque
    if vehicle.image_url:
        path = vehicle.image_url.lstrip("/")
        if os.path.exists(path):
            os.remove(path)

    db.delete(vehicle)
    db.commit()
    return {"message": "Vehicle deleted"}

@router.get("/{vehicle_id}/booked-dates")
def get_booked_dates(
    vehicle_id: int,
    db: Session = Depends(get_db)
):

    bookings = db.query(Booking).filter(
        Booking.vehicle_id == vehicle_id,
        Booking.status.in_(["PENDING", "CONFIRMED"])
    ).all()

    return [
        {
            "start_date": b.start_date,
            "end_date": b.end_date
        }
        for b in bookings
    ]