from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.mongodb import MongoDB
from app.api.v1 import api_router
from app.utils.logger import setup_logger
# import argparse
logger = setup_logger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.API_VERSION,
    debug=settings.DEBUG
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://162.43.27.150:3000",
        "https://162.43.27.150:3000",
        "*"  # Allow all origins for development - change this in production
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers"
    ],
    expose_headers=["Content-Type", "Authorization"],
    max_age=3600,
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "run:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
