from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles

from app.api import auth, admin, vehicles, bookings, totp, customers
from app.database.database import Base, engine
from app.database.init_db import init_admin_user

# Import explicite de tous les modèles pour que Base les connaisse
from app.models import user, vehicle, booking , customer # <-- AJOUTE CETTE LIGNE

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    init_admin_user()
    yield

app = FastAPI(title="AutoReserve API", lifespan=lifespan)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
        "https://location-app-4b288.web.app",
        "https://location-app-4b288.firebaseapp.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(vehicles.router)
app.include_router(bookings.router)
app.include_router(totp.router)
app.include_router(customers.router)

@app.get("/")
def root():
    return {"message": "AutoReserve API Running"}