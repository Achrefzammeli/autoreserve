from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.models.booking import Booking
from app.models.vehicle import Vehicle
from app.models.customer import Customer

from app.schemas.booking import BookingCreate, BookingOut, BookingAdminOut

from app.services.booking_service import (
    calculate_days,
    calculate_price
)

router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)


@router.post("/", response_model=BookingOut)
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db)
):

    customer = db.query(Customer).filter(
        Customer.id == booking.customer_id
    ).first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    vehicle = db.query(Vehicle).filter(
        Vehicle.id == booking.vehicle_id
    ).first()

    if not vehicle:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )

    if vehicle.status != "AVAILABLE":
        raise HTTPException(
            status_code=400,
            detail="Vehicle not available"
        )

    existing_booking = db.query(Booking).filter(
        Booking.vehicle_id == booking.vehicle_id,
        Booking.status != "CANCELLED",
        Booking.start_date <= booking.end_date,
        Booking.end_date >= booking.start_date
    ).first()

    if existing_booking:
        raise HTTPException(
            status_code=400,
            detail="Vehicle already booked for selected dates"
        )

    days = calculate_days(
        booking.start_date,
        booking.end_date
    )

    total_price = calculate_price(
        days,
        vehicle.price_per_day
    )

    new_booking = Booking(
        customer_id=customer.id,
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


@router.get("/", response_model=list[BookingAdminOut])
def get_all_bookings(
    db: Session = Depends(get_db)
):

    bookings = db.query(Booking).all()

    result = []

    for booking in bookings:

        customer = db.query(Customer).filter(
            Customer.id == booking.customer_id
        ).first()

        vehicle = db.query(Vehicle).filter(
            Vehicle.id == booking.vehicle_id
        ).first()

        result.append(
            BookingAdminOut(
                id=booking.id,
                customer_id=booking.customer_id,
                vehicle_id=booking.vehicle_id,
                start_date=booking.start_date,
                end_date=booking.end_date,
                total_price=booking.total_price,
                status=booking.status,

                customer_name=customer.full_name if customer else None,
                customer_cin=customer.cin if customer else None,
                customer_phone=customer.phone if customer else None,

                vehicle_brand=vehicle.brand if vehicle else None,
                vehicle_model=vehicle.model if vehicle else None
            )
        )

    return result


@router.put("/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    status: str,
    db: Session = Depends(get_db)
):

    booking = db.query(Booking).filter(
        Booking.id == booking_id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    booking.status = status

    db.commit()

    return {
        "message": f"Booking updated to {status}"
    }


@router.delete("/{booking_id}")
def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db)
):

    booking = db.query(Booking).filter(
        Booking.id == booking_id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    db.delete(booking)
    db.commit()

    return {
        "message": "Booking deleted successfully"
    }