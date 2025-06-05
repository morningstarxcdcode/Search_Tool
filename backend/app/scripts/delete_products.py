from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection settings
MONGODB_URL = "mongodb://localhost:27017"
DB_NAME = "mercari_search"
COLLECTION_NAME = "products"

async def delete_all_products():
    """Delete all products from the MongoDB collection"""
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]

        # Delete all documents
        result = await collection.delete_many({})
        
        logger.info(f"Successfully deleted {result.deleted_count} products from the collection")
        
        # Close the connection
        client.close()
        
    except Exception as e:
        logger.error(f"Error deleting products: {str(e)}")
        raise

async def delete_products_by_filter(filter_query):
    """Delete products matching the given filter query"""
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]

        # Delete documents matching the filter
        result = await collection.delete_many(filter_query)
        
        logger.info(f"Successfully deleted {result.deleted_count} products matching the filter")
        
        # Close the connection
        client.close()
        
    except Exception as e:
        logger.error(f"Error deleting products: {str(e)}")
        raise

async def remove_brand_field():
    """Remove the brand field from all products while keeping other fields"""
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]

        # Update all documents to unset the brand field
        result = await collection.update_many(
            {},  # match all documents
            {"$unset": {"brand": ""}}  # remove brand field
        )
        
        logger.info(f"Successfully removed brand field from {result.modified_count} products")
        
        # Close the connection
        client.close()
        
    except Exception as e:
        logger.error(f"Error removing brand field: {str(e)}")
        raise

async def main():
    # Remove brand field from all products
    await remove_brand_field()
    
    # Example 1: Delete all products
    # await delete_all_products()
    
    # Example 2: Delete products with specific filter
    # filter_query = {"brand": "NIKE"}  # Example filter
    # await delete_products_by_filter(filter_query)

if __name__ == "__main__":
    asyncio.run(main()) 