from motor.motor_asyncio import AsyncIOMotorClient
from ..core.config import settings
from ..utils.logger import setup_logger

logger = setup_logger(__name__)

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

    @classmethod
    async def connect_to_database(cls):
        """Create database connection."""
        try:
            cls.client = AsyncIOMotorClient(settings.MONGODB_URL)
            cls.db = cls.client[settings.MONGODB_DB_NAME]
            
            # Create indexes
            await cls.create_indexes()
            
            logger.info("Connected to MongoDB")
        except Exception as e:
            logger.error(f"Could not connect to MongoDB: {e}")
            raise

    @classmethod
    async def create_indexes(cls):
        """Create necessary indexes."""
        try:
            # Drop existing indexes
            await cls.db.users.drop_indexes()
            
            # Create unique index on email
            await cls.db.users.create_index("email", unique=True)
            
            # Create index on phone (not unique, allow null)
            await cls.db.users.create_index(
                [("phone", 1)],
                sparse=True,
                name="phone_sparse_idx"
            )
            
            logger.info("Created MongoDB indexes")
        except Exception as e:
            logger.error(f"Could not create indexes: {e}")
            raise

    @classmethod
    async def close_database_connection(cls):
        """Close database connection."""
        if cls.client is not None:
            cls.client.close()
            cls.client = None
            cls.db = None
            logger.info("Closed MongoDB connection")

    @classmethod
    def get_database(cls):
        """Get database instance."""
        return cls.db 