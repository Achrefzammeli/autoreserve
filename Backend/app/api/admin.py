from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.dependencies import require_role
from app.database.dependencies import get_db
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.booking import Booking
from app.schemas.user import UserOut
from app.schemas.booking import BookingAdminOut, BookingStatusUpdate, BookingCreate
from app.models.customer import Customer
from app.schemas.customer import CustomerAdminOut


router = APIRouter(prefix="/admin", tags=["Admin"])


# ─── DASHBOARD STATS ────────────────────────────────────────────────────────

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin=Depends(require_role("ADMIN"))
):
    total_bookings = db.query(Booking).count()
    confirmed_bookings = db.query(Booking).filter(Booking.status == "CONFIRMED").count()
    pending_bookings = db.query(Booking).filter(Booking.status == "PENDING").count()
    cancelled_bookings = db.query(Booking).filter(Booking.status == "CANCELLED").count()

    total_revenue = db.query(Booking).filter(
        Booking.status.in_(["CONFIRMED", "PENDING"])
    ).all()
    revenue = sum(b.total_price for b in total_revenue)

    total_vehicles = db.query(Vehicle).count()
    available_vehicles = db.query(Vehicle).filter(Vehicle.status == "AVAILABLE").count()
    maintenance_vehicles = db.query(Vehicle).filter(Vehicle.status == "MAINTENANCE").count()
    unavailable_vehicles = db.query(Vehicle).filter(Vehicle.status == "UNAVAILABLE").count()

    total_customers = db.query(User).filter(User.role == "CLIENT").count()

    return {
        "bookings": {
            "total": total_bookings,
            "confirmed": confirmed_bookings,
            "pending": pending_bookings,
            "cancelled": cancelled_bookings,
        },
        "revenue": {
            "total": round(revenue, 2),
        },
        "vehicles": {
            "total": total_vehicles,
            "available": available_vehicles,
            "maintenance": maintenance_vehicles,
            "unavailable": unavailable_vehicles,
        },
        "customers": {
            "total": total_customers,
        }
    }


# ─── CUSTOMERS ──────────────────────────────────────────────────────────────

@router.get("/users", response_model=List[UserOut])
def get_all_users(
    db: Session = Depends(get_db),
    admin=Depends(require_role("ADMIN"))
):
    return db.query(User).filter(User.role == "CLIENT").all()


@router.get("/users/{user_id}", response_model=UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_role("ADMIN"))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ─── BOOKINGS MANAGEMENT ────────────────────────────────────────────────────
@router.get("/bookings", response_model=List[BookingAdminOut])
def get_all_bookings(
    db: Session = Depends(get_db),
    admin=Depends(require_role("ADMIN"))
):
    bookings = db.query(Booking).order_by(Booking.created_at.desc()).all()

    result = []

    for b in bookings:

        customer = db.query(Customer).filter(
            Customer.id == b.customer_id
        ).first()

        vehicle = db.query(Vehicle).filter(
            Vehicle.id == b.vehicle_id
        ).first()

        result.append(
            BookingAdminOut(
                id=b.id,
                customer_id=b.customer_id,
                vehicle_id=b.vehicle_id,

                start_date=b.start_date,
                end_date=b.end_date,

                total_price=b.total_price,
                status=b.status,

                customer_name=customer.full_name if customer else None,
                customer_cin=customer.cin if customer else None,
                customer_phone=customer.phone if customer else None,

                vehicle_brand=vehicle.brand if vehicle else None,
                vehicle_model=vehicle.model if vehicle else None,
            )
        )

    return result

@router.put("/bookings/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    body: BookingStatusUpdate,
    db: Session = Depends(get_db),
    admin=Depends(require_role("ADMIN"))
):
    allowed = {"CONFIRMED", "CANCELLED", "PENDING"}
    if body.status not in allowed:
        raise HTTPException(status_code=400, detail=f"Status must be one of {allowed}")

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = body.status
    db.commit()
    db.refresh(booking)

    return {"message": f"Booking {booking_id} updated to {body.status}", "booking_id": booking_id, "status": body.status}


# ─── REPORTS ────────────────────────────────────────────────────────────────

@router.get("/reports")
def get_reports(
    db: Session = Depends(get_db),
    admin=Depends(require_role("ADMIN"))
):
    from collections import defaultdict

    vehicles = db.query(Vehicle).all()
    bookings = db.query(Booking).filter(Booking.status.in_(["CONFIRMED", "PENDING"])).all()

    vehicle_map = {v.id: v for v in vehicles}

    revenue_by_brand: dict = {}
    bookings_by_brand: dict = {}

    for b in bookings:
        v = vehicle_map.get(b.vehicle_id)
        if not v:
            continue
        key = v.brand
        revenue_by_brand[key] = revenue_by_brand.get(key, 0) + b.total_price
        bookings_by_brand[key] = bookings_by_brand.get(key, 0) + 1

    # Top vehicles by bookings
    vehicle_booking_count: dict = {}
    for b in db.query(Booking).all():
        vehicle_booking_count[b.vehicle_id] = vehicle_booking_count.get(b.vehicle_id, 0) + 1

    top_vehicles = sorted(vehicle_booking_count.items(), key=lambda x: x[1], reverse=True)[:5]
    top_vehicles_out = []
    for vid, count in top_vehicles:
        v = vehicle_map.get(vid)
        if v:
            top_vehicles_out.append({
                "vehicle_id": vid,
                "brand": v.brand,
                "model": v.model,
                "bookings_count": count
            })

    # Monthly revenue
    monthly: dict = defaultdict(float)
    for b in db.query(Booking).filter(Booking.status.in_(["CONFIRMED", "PENDING"])).all():
        key = b.start_date.strftime("%Y-%m")
        monthly[key] += b.total_price

    monthly_sorted = [{"month": k, "revenue": round(v, 2)} for k, v in sorted(monthly.items())]

    return {
        "revenue_by_type": [{"type": k, "revenue": round(v, 2)} for k, v in revenue_by_brand.items()],
        "bookings_by_type": [{"type": k, "count": v} for k, v in bookings_by_brand.items()],
        "top_vehicles": top_vehicles_out,
        "monthly_revenue": monthly_sorted,
    }
@router.post("/bookings")
def admin_create_booking(
    body: BookingCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_role("ADMIN"))
):
    customer = db.query(Customer).filter(Customer.id == body.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    vehicle = db.query(Vehicle).filter(Vehicle.id == body.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if vehicle.status != "AVAILABLE":
        raise HTTPException(status_code=400, detail="Vehicle not available")

    # overlap check
    conflict = db.query(Booking).filter(
        Booking.vehicle_id == body.vehicle_id,
        Booking.status != "CANCELLED",
        Booking.start_date <= body.end_date,
        Booking.end_date >= body.start_date
    ).first()

    if conflict:
        raise HTTPException(status_code=400, detail="Vehicle already booked")

    days = (body.end_date - body.start_date).days + 1
    total_price = days * vehicle.price_per_day

    booking = Booking(
        customer_id=body.customer_id,
        vehicle_id=body.vehicle_id,
        start_date=body.start_date,
        end_date=body.end_date,
        total_price=total_price,
        status="CONFIRMED"
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return booking
@router.get("/vehicle/{vehicle_id}/calendar")
def get_vehicle_calendar(vehicle_id: int, db: Session = Depends(get_db)):

    bookings = db.query(Booking).filter(
        Booking.vehicle_id == vehicle_id,
        Booking.status == "CONFIRMED"
    ).all()

    result = []

    for b in bookings:
        result.append({
            "start": b.start_date,
            "end": b.end_date
        })

    return result