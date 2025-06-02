from pydantic import BaseModel, Field
from typing import Optional, List

class SearchRequest(BaseModel):
    keyword: str = Field(..., description="Search keyword")
    min_price: Optional[int] = Field(None, description="Minimum price")
    max_price: Optional[int] = Field(None, description="Maximum price")
    category: Optional[str] = Field(None, description="Category ID")
    sort_by: Optional[str] = Field(None, description="Sort order")
    limit: int = Field(5, description="Maximum number of results")

class SearchResult(BaseModel):
    id: str = Field(..., description="Product ID")
    name: str = Field(..., description="Product name")
    price: int = Field(..., description="Product price in JPY")
    price_text: str = Field(..., description="Formatted price text")
    url: str = Field(..., description="Product URL")
    image_url: str = Field(..., description="Product image URL")
    brand: Optional[str] = Field(None, description="Product brand")
    category: Optional[str] = Field(None, description="Product category")
    condition: Optional[str] = Field(None, description="Product condition")
    seller_name: Optional[str] = Field(None, description="Seller name")
    description: Optional[str] = Field(None, description="Product description")

class SearchResponse(BaseModel):
    results: List[SearchResult] = Field(default_factory=list, description="List of search results") 