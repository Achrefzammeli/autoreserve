from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
import pyotp
import qrcode
import qrcode.image.svg
import io
import base64

from app.database.dependencies import get_db
from app.models.user import User
from app.core.security import hash_password

router = APIRouter(prefix="/totp", tags=["TOTP"])


# ── Schemas ──────────────────────────────────────────────────────────

class EmailRequest(BaseModel):
    email: EmailStr

class VerifyTOTPRequest(BaseModel):
    email: EmailStr
    code: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str


# ── Step 1 : check email + return QR or just ask code ────────────────

@router.post("/setup")
def setup_totp(body: EmailRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email.")

    # TOTP déjà setup et confirmé → juste demander le code
    if user.totp_enabled and user.totp_secret:
        return {
            "status":  "already_setup",
            "message": "Enter the 6-digit code from your authenticator app."
        }

    # Compte existe mais TOTP pas encore confirmé → refuser le reset
    if not user.totp_enabled:
        raise HTTPException(
            status_code=403,
            detail="Account not fully activated. Complete your TOTP setup first."
        )
# ── Step 2 : verify TOTP code ────────────────────────────────────────

@router.post("/verify")
def verify_totp(body: VerifyTOTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not user.totp_secret:
        raise HTTPException(status_code=400, detail="TOTP not configured for this account.")

    totp  = pyotp.TOTP(user.totp_secret)
    valid = totp.verify(body.code, valid_window=1)

    if not valid:
        raise HTTPException(status_code=400, detail="Invalid or expired code. Try again.")

    # Mark TOTP as enabled (first setup confirmation)
    if not user.totp_enabled:
        user.totp_enabled = True
        db.commit()

    return {"status": "verified", "message": "Code verified successfully."}


# ── Step 3 : reset password after TOTP verified ──────────────────────

@router.post("/reset-password")
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not user.totp_secret:
        raise HTTPException(status_code=400, detail="TOTP not configured for this account.")

    totp  = pyotp.TOTP(user.totp_secret)
    valid = totp.verify(body.code, valid_window=1)

    if not valid:
        raise HTTPException(status_code=400, detail="Invalid or expired code.")

    user.hashed_password = hash_password(body.new_password)
    db.commit()

    return {"status": "success", "message": "Password updated successfully."}