from fastapi import FastAPI
from app.api import auth, admin
from app.database.database import Base, engine
from app.models import user

Base.metadata.create_all(bind=engine)
app = FastAPI(title="AutoReserve API")

app.include_router(auth.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {"message": "AutoReserve API Running"}