from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()

class ProductResponse(BaseModel):
    id: str
    name: str
    price: int
    price_text: str
    url: str
    image_url: str
    brand: Optional[str] = None
    category: Optional[str] = None
    condition: Optional[str] = None
    seller_name: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class ProductSearch(BaseModel):
    category: Optional[str] = None
    brand: Optional[str] = None
    min_price: Optional[int] = None
    max_price: Optional[int] = None

@router.get("/", response_model=List[ProductResponse])
async def get_products(
    skip: int = 0,
    limit: int = 10,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None
):
    """Get products from MongoDB with optional filters"""
    print("Fetching products from MongoDB...")
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient('mongodb://localhost:27017')
        db = client.mercari_search
        collection = db.products

        # Build filter
        filter_query = {}
        if category:
            filter_query['category'] = {'$regex': category, '$options': 'i'}
        if brand:
            filter_query['brand'] = {'$regex': brand, '$options': 'i'}
        if min_price is not None or max_price is not None:
            filter_query['price'] = {}
            if min_price is not None:
                filter_query['price']['$gte'] = min_price
            if max_price is not None:
                filter_query['price']['$lte'] = max_price

        print(f"Using filter query: {filter_query}")

        # Get products
        cursor = collection.find(filter_query).skip(skip).limit(limit)
        products = await cursor.to_list(length=limit)
        
        print(f"Found {len(products)} products")

        # Close MongoDB connection
        client.close()

        return products

    except Exception as e:
        print(f"Error fetching products: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search", response_model=List[ProductResponse])
async def search_products(search: ProductSearch):
    """Search products with JSON filters"""
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient('mongodb://localhost:27017')
        db = client.mercari_search
        collection = db.products

        # Build filter
        filter_query = {}
        if search.category:
            filter_query['category'] = {'$regex': search.category, '$options': 'i'}
        if search.brand:
            filter_query['brand'] = {'$regex': search.brand, '$options': 'i'}
        if search.min_price is not None or search.max_price is not None:
            filter_query['price'] = {}
            if search.min_price is not None:
                filter_query['price']['$gte'] = search.min_price
            if search.max_price is not None:
                filter_query['price']['$lte'] = search.max_price

        # Get products
        cursor = collection.find(filter_query)
        products = await cursor.to_list(length=100)  # Limit to 100 results

        # Close MongoDB connection
        client.close()

        return products

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    """Get a single product by ID"""
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient('mongodb://localhost:27017')
        db = client.mercari_search
        collection = db.products

        # Get product
        product = await collection.find_one({'id': product_id})
        
        # Close MongoDB connection
        client.close()

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        return product

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 