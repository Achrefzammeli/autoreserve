from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleOut
from app.core.dependencies import require_role

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])
@router.post("/", response_model=VehicleOut)
def create_vehicle(
    vehicle: VehicleCreate,
    db: Session = Depends(get_db),
    admin = Depends(require_role("ADMIN"))
):

    new_vehicle = Vehicle(**vehicle.dict())

    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)

    return new_vehicle
@router.get("/", response_model=list[VehicleOut])
def get_vehicles(db: Session = Depends(get_db)):

    return db.query(Vehicle).all()
@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):

    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    return vehicle
@router.put("/{vehicle_id}", response_model=VehicleOut)
def update_vehicle(
    vehicle_id: int,
    vehicle: VehicleCreate,
    db: Session = Depends(get_db),
    admin = Depends(require_role("ADMIN"))
):

    db_vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    for key, value in vehicle.dict().items():
        setattr(db_vehicle, key, value)

    db.commit()
    db.refresh(db_vehicle)

    return db_vehicle
@router.delete("/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    admin = Depends(require_role("ADMIN"))
):

    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    db.delete(vehicle)
    db.commit()

    return {"message": "Vehicle deleted"}