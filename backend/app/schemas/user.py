from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    full_name: str
    role: str
    department: Optional[str] = None

class UserBase(BaseModel):
    email: str
    full_name: str
    role: str = "procurement"
    department: Optional[str] = "Procurement & Sourcing"
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

