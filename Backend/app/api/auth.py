from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pyotp
import qrcode
import io
import base64

from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserOut
from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.user import UserLogin, Token
from app.core.dependencies import get_current_user
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/auth", tags=["Auth"])


# ── Schemas locaux ────────────────────────────────────────────────────

class ConfirmTOTPRequest(BaseModel):
    email: EmailStr
    code: str


# ── Register : crée le compte + génère le QR TOTP ────────────────────

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):

    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Génère le secret TOTP dès la création
    secret = pyotp.random_base32()

    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hash_password(user.password),
        role="CLIENT",
        totp_secret=secret,
        totp_enabled=False  # pas encore confirmé
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Génère le QR code
    totp = pyotp.TOTP(secret)
    uri  = totp.provisioning_uri(
        name=new_user.email,
        issuer_name="AutoReserve"
    )

    img    = qrcode.make(uri)
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    qr_b64 = base64.b64encode(buffer.getvalue()).decode()

    return {
        "id":      new_user.id,
        "name":    new_user.name,
        "email":   new_user.email,
        "role":    new_user.role,
        "status":  "pending_totp",
        "qr_code": f"data:image/png;base64,{qr_b64}",
        "secret":  secret,
        "message": "Scan this QR code with Authy or Google Authenticator to activate your account."
    }


# ── Confirm TOTP : active le compte après scan ────────────────────────

@router.post("/confirm-totp")
def confirm_totp(body: ConfirmTOTPRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Account not found")

    if user.totp_enabled:
        raise HTTPException(status_code=400, detail="TOTP already confirmed for this account")

    if not user.totp_secret:
        raise HTTPException(status_code=400, detail="TOTP not initialized")

    totp  = pyotp.TOTP(user.totp_secret)
    valid = totp.verify(body.code, valid_window=1)

    if not valid:
        raise HTTPException(status_code=400, detail="Invalid or expired code. Try again.")

    user.totp_enabled = True
    db.commit()

    return {
        "status":  "activated",
        "message": "Account activated successfully. You can now sign in."
    }


# ── Login : bloque les comptes non confirmés ──────────────────────────

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token(
        data={"sub": str(db_user.id), "role": db_user.role}
    )

    return {"access_token": token, "token_type": "bearer"}

# ── Me ────────────────────────────────────────────────────────────────

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return current_user