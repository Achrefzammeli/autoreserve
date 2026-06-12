from pydantic import BaseModel, EmailStr


# INPUT (register)
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


# OUTPUT (response API)
class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"