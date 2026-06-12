from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import hashlib

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# --------------------
# PASSWORD HASH
# --------------------
def hash_password(password: str):
    password_bytes = hashlib.sha256(password.encode()).hexdigest()
    return pwd_context.hash(password_bytes)


def verify_password(plain_password, hashed_password):
    password_bytes = hashlib.sha256(plain_password.encode()).hexdigest()
    return pwd_context.verify(password_bytes, hashed_password)


# --------------------
# JWT TOKEN
# --------------------
def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return encoded_jwt
def decode_access_token(token: str):
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        return payload

    except JWTError:
        return None