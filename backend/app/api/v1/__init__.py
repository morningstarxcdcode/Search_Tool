from fastapi import APIRouter
from .auth import router as auth_router
from .products import router as products_router
from app.routers.search import router as search_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(products_router, prefix="/products", tags=["products"])
api_router.include_router(search_router, prefix="/search", tags=["search"]) 