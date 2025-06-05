from fastapi import APIRouter
from .auth import router as auth_router
from .products import router as products_router
from .user import router as user_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(products_router, prefix="/products", tags=["products"])
api_router.include_router(user_router, prefix="/user", tags=["user"]) 