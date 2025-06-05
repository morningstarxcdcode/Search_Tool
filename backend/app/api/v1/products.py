from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# MongoDB connection settings
MONGODB_URL = "mongodb://localhost:27017"
DB_NAME = "mercari_search"
COLLECTION_NAME = "products"

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
    keyword: str
    category: Optional[str] = None
    brand: Optional[str] = None
    min_price: Optional[int] = None
    max_price: Optional[int] = None

async def get_database():
    """Get database connection"""
    try:
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[DB_NAME]
        return client, db
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        raise HTTPException(status_code=500, detail="Database connection failed")

@router.get("/", response_model=List[ProductResponse])
async def get_products(
    skip: int = 0,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None
):
    """Get products from MongoDB with optional filters"""
    logger.info("Fetching products from MongoDB...")
    try:
        client, db = await get_database()
        collection = db[COLLECTION_NAME]

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

        logger.info(f"Using filter query: {filter_query}")

        # Get products with limit
        cursor = collection.find(filter_query).skip(skip)
        products = await cursor.to_list(length=100)  # Limit to 100 results
        
        logger.info(f"Found {len(products)} products")

        # Close MongoDB connection
        client.close()

        if not products:
            return []

        return products

    except Exception as e:
        logger.error(f"Error fetching products: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search", response_model=List[ProductResponse])
async def search_products(search: ProductSearch):
    """Search products with JSON filters"""
    try:
        client, db = await get_database()
        collection = db[COLLECTION_NAME]

        # Build filter
        filter_query = {}
        if search.keyword:
            filter_query['name'] = {'$regex': search.keyword, '$options' : 'i'}
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

        if not products:
            return []

        return products

    except Exception as e:
        logger.error(f"Error searching products: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    """Get a single product by ID"""
    try:
        client, db = await get_database()
        collection = db[COLLECTION_NAME]

        # Get product
        product = await collection.find_one({'id': product_id})
        
        # Close MongoDB connection
        client.close()

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        return product

    except Exception as e:
        logger.error(f"Error fetching product {product_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 