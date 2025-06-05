from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.api.v1 import api_router
from app.api.v1 import health, mercari_scraper, products, auth
from app.core.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.utils.logger import setup_logger
import os

logger = setup_logger(__name__)
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create static directory if it doesn't exist
os.makedirs("app/static", exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Include main API router (includes all v1 routes: auth, products, search)
app.include_router(api_router, prefix="/api/v1")

# Include additional routers that are not part of the main api_router
app.include_router(health.router, prefix="/api/v1/health", tags=["health"])
app.include_router(mercari_scraper.router, prefix="/api/v1/mercari", tags=["mercari"])

@app.get("/")
async def read_root():
    return FileResponse("app/static/index.html")

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()
    logger.info("Application startup complete.")

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()
    logger.info("Application shutdown complete.") 