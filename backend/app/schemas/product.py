from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ProductBase(BaseModel):
    """Base product model"""
    id: str = Field(..., alias="_id")
    name: str
    price: int
    price_text: str
    url: str
    image_url: str
    category: Optional[str] = None
    condition: Optional[str] = None
    description: Optional[str] = None
    like_count: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

class ProductCreate(ProductBase):
    """Product creation model"""
    pass

class ProductUpdate(BaseModel):
    """Product update model"""
    name: Optional[str] = None
    price: Optional[int] = None
    price_text: Optional[str] = None
    category: Optional[str] = None
    condition: Optional[str] = None
    description: Optional[str] = None
    like_count: Optional[int] = None

    class Config:
        populate_by_name = True

class ProductResponse(ProductBase):
    """Product response model"""
    pass 