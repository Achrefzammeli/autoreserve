from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, admin, vehicles, bookings
from app.database.database import Base, engine
from app.models import user

Base.metadata.create_all(bind=engine)
app = FastAPI(title="AutoReserve API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(vehicles.router)
app.include_router(bookings.router)


@app.get("/")
def root():
    return {"message": "AutoReserve API Running"}