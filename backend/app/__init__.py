from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .db.mongodb import MongoDB
from .api.v1 import api_router
from .utils.logger import setup_logger

logger = setup_logger(__name__)

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.API_VERSION,
        debug=settings.DEBUG
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include API router
    app.include_router(api_router, prefix=f"/api/v{settings.API_VERSION}")

    @app.on_event("startup")
    async def startup_db_client():
        """Initialize database connection on startup"""
        await MongoDB.connect_to_database()
        logger.info("Connected to MongoDB")

    @app.on_event("shutdown")
    async def shutdown_db_client():
        """Close database connection on shutdown"""
        await MongoDB.close_database_connection()
        logger.info("Disconnected from MongoDB")

    return app