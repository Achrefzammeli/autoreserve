from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.booking import Booking
from app.models.vehicle import Vehicle
from app.schemas.booking import BookingCreate, BookingOut
from app.core.dependencies import get_current_user

from app.services.booking_service import calculate_days, calculate_price

router = APIRouter(prefix="/bookings", tags=["Bookings"])
@router.post("/", response_model=BookingOut)
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    vehicle = db.query(Vehicle).filter(Vehicle.id == booking.vehicle_id).first()

    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if vehicle.status != "AVAILABLE":
        raise HTTPException(status_code=400, detail="Vehicle not available")

    days = calculate_days(booking.start_date, booking.end_date)
    total_price = calculate_price(days, vehicle.price_per_day)

    new_booking = Booking(
        user_id=current_user.id,
        vehicle_id=vehicle.id,
        start_date=booking.start_date,
        end_date=booking.end_date,
        total_price=total_price,
        status="PENDING"
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return new_booking
@router.get("/my", response_model=list[BookingOut])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    return db.query(Booking).filter(
        Booking.user_id == current_user.id
    ).all()
from app.core.dependencies import require_role


@router.get("/", response_model=list[BookingOut])
def get_all_bookings(
    db: Session = Depends(get_db),
    admin = Depends(require_role("ADMIN"))
):

    return db.query(Booking).all()
@router.put("/{booking_id}/cancel")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == current_user.id
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = "CANCELLED"

    db.commit()

    return {"message": "Booking cancelled"}