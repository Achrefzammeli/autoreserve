from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.booking import Booking
from app.schemas.customer import CustomerAdminOut
from app.database.dependencies import get_db
from app.models.customer import Customer
from app.schemas.customer import (
    CustomerCreate,
    CustomerUpdate,
    CustomerOut
)

router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)
@router.post("/", response_model=CustomerOut)
def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db)
):

    existing = db.query(Customer).filter(
        Customer.cin == customer.cin
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="CIN already exists"
        )

    new_customer = Customer(
        full_name=customer.full_name,
        cin=customer.cin,
        phone=customer.phone,
        email=customer.email,
        address=customer.address,
        notes=customer.notes
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer
@router.get("/", response_model=list[CustomerAdminOut])
def get_customers(
    db: Session = Depends(get_db)
):

    customers = db.query(Customer).all()

    result = []

    for customer in customers:

        bookings = db.query(Booking).filter(
            Booking.customer_id == customer.id
        ).all()

        bookings_count = len(bookings)

        total_revenue = sum(
            booking.total_price
            for booking in bookings
            if booking.status != "CANCELLED"
        )

        last_booking = None

        if bookings:
            last_booking = max(
                booking.start_date
                for booking in bookings
            )

        result.append(
            CustomerAdminOut(
                id=customer.id,
                full_name=customer.full_name,
                cin=customer.cin,
                phone=customer.phone,
                email=customer.email,
                address=customer.address,

                bookings_count=bookings_count,
                total_revenue=total_revenue,
                last_booking=last_booking
            )
        )

    return result
@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(
    customer_id: int,
    payload: CustomerUpdate,
    db: Session = Depends(get_db)
):

    customer = db.query(Customer).filter(
        Customer.id == customer_id
    ).first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    customer.full_name = payload.full_name
    customer.cin = payload.cin
    customer.phone = payload.phone
    customer.email = payload.email
    customer.address = payload.address
    customer.notes = payload.notes

    db.commit()
    db.refresh(customer)

    return customer
@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):

    customer = db.query(Customer).filter(
        Customer.id == customer_id
    ).first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    return customer
@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):

    customer = db.query(Customer).filter(
        Customer.id == customer_id
    ).first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    db.delete(customer)
    db.commit()

    return {
        "message": "Customer deleted successfully"
    }