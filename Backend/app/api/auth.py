from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserOut
from app.core.security import hash_password
from app.core.security import verify_password, create_access_token
from app.schemas.user import UserLogin, Token
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):

    # check email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hash_password(user.password),
        role="CLIENT"   # 🔥 forced backend rule
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user
@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token(
        data={
            "sub": str(db_user.id),
            "role": db_user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }
@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return current_user