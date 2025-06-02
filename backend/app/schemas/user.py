from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    """Base user model"""
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[int] = Field(None, description="Optional phone number")
    role: str = Field("user", pattern="^(user|admin)$")
    plan: str = Field("basic", pattern="^(basic|standard|premium)$")
    impo_noti: bool = Field(False, alias="impo-noti")
    trend_noti: bool = Field(False, alias="trend-noti")
    update_noti: bool = Field(False, alias="update-noti")
    search_report: bool = Field(False, alias="search-report")
    pay_info: Optional[str] = Field(None, alias="pay-info")

class UserCreate(UserBase):
    """User creation model"""
    password: str = Field(..., min_length=8)

class UserInDB(UserBase):
    """User model as stored in database"""
    id: str = Field(..., alias="_id")
    verify: Optional[str] = None
    expires_in: Optional[int] = Field(None, alias="expiresIn")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True

class UserResponse(UserBase):
    """User response model"""
    id: str = Field(..., alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

class Token(BaseModel):
    """Token model"""
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    """Token data model"""
    email: Optional[str] = None

class UserUpdate(BaseModel):
    """User update model"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[int] = Field(None, description="Optional phone number")
    password: Optional[str] = Field(None, min_length=8, description="New password")
    plan: Optional[str] = Field(None, pattern="^(basic|standard|premium)$")
    impo_noti: Optional[bool] = Field(None, alias="impo-noti")
    trend_noti: Optional[bool] = Field(None, alias="trend-noti")
    update_noti: Optional[bool] = Field(None, alias="update-noti")
    search_report: Optional[bool] = Field(None, alias="search-report")
    pay_info: Optional[str] = Field(None, alias="pay-info")

    class Config:
        populate_by_name = True 