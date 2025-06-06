from datetime import timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from ...schemas.user import (
    UserCreate, UserResponse, Token, UserUpdate, UserInDB,
    NotificationSettings, PasswordChange
)
from ...utils.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_active_user
)
from ...db.mongodb import MongoDB
from ...core.config import settings
from ...utils.logger import setup_logger
from bson import ObjectId
import logging

logger = setup_logger(__name__)
router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    """
    Register a new user
    
    Args:
        user: User creation data
        
    Returns:
        UserResponse: Created user data
    """
    db = MongoDB.get_database()
    
    # Check if user already exists
    if await db.users.find_one({"email": user.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user document
    user_dict = user.model_dump()
    user_dict["password"] = get_password_hash(user_dict.pop("password"))
    
    # Add timestamps
    current_time = datetime.utcnow()
    user_dict["created_at"] = current_time
    user_dict["updated_at"] = current_time
    
    # Insert user
    result = await db.users.insert_one(user_dict)
    user_dict["_id"] = str(result.inserted_id)
    
    return UserResponse(**user_dict)

@router.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login user and get access token
    
    Args:
        form_data: OAuth2 password form data
        
    Returns:
        Token: Access token
    """
    db = MongoDB.get_database()
    print(form_data.username)
    user = await db.users.find_one({"email": form_data.username})
    print(user)
    
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user = Depends(get_current_active_user)):
    """
    Get current user information
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        UserResponse: Current user data
    """
    print(current_user)
    return current_user 

@router.patch("/me", response_model=UserResponse)
async def update_user(
    user_update: UserUpdate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Update current user information
    
    Args:
        user_update: User update data
        current_user: Current authenticated user
        
    Returns:
        UserResponse: Updated user data
    """
    db = MongoDB.get_database()
    
    # Convert update data to dict and remove None values
    update_data = user_update.model_dump(exclude_unset=True)
    
    logger.info(f"Update data received: {update_data}")
    logger.info(f"Current user ID: {current_user.id}")
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data to update"
        )
    
    # Handle password update separately
    if "password" in update_data:
        update_data["password"] = get_password_hash(update_data["password"])
    
    try:
        # Convert string ID to ObjectId for MongoDB query
        user_id = ObjectId(current_user.id)
        
        # Update user document
        result = await db.users.update_one(
            {"_id": user_id},
            {"$set": {
                **update_data,
                "updated_at": datetime.utcnow()
            }}
        )
        
        logger.info(f"Update result: {result.modified_count} documents modified")
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update user"
            )
        
        # Get updated user
        updated_user = await db.users.find_one({"_id": user_id})
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found after update"
            )
            
        updated_user["_id"] = str(updated_user["_id"])
        logger.info(f"Updated user data: {updated_user}")
        
        return UserResponse(**updated_user)
        
    except Exception as e:
        logger.error(f"Error updating user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error updating user: {str(e)}"
        )

@router.patch("/me/profile", response_model=UserResponse)
async def update_profile(
    profile_update: UserUpdate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Update user profile information
    
    Args:
        profile_update: Profile update data
        current_user: Current authenticated user
        
    Returns:
        UserResponse: Updated user data
    """
    db = MongoDB.get_database()
    
    # Convert update data to dict and remove None values
    update_data = profile_update.model_dump(exclude_unset=True)
    
    # Only allow updating specific profile fields
    allowed_fields = {"name", "email", "phone"}
    update_data = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid profile data to update"
        )
    
    try:
        user_id = ObjectId(current_user.id)
        
        # Update user document
        result = await db.users.update_one(
            {"_id": user_id},
            {"$set": {
                **update_data,
                "updated_at": datetime.utcnow()
            }}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update profile"
            )
        
        # Get updated user
        updated_user = await db.users.find_one({"_id": user_id})
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found after update"
            )
            
        updated_user["_id"] = str(updated_user["_id"])
        return UserResponse(**updated_user)
        
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error updating profile: {str(e)}"
        )

@router.patch("/me/notifications", response_model=UserResponse)
async def update_notification_settings(
    notification_settings: NotificationSettings,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Update user notification settings
    
    Args:
        notification_settings: Notification settings data
        current_user: Current authenticated user
        
    Returns:
        UserResponse: Updated user data
    """
    db = MongoDB.get_database()
    
    try:
        user_id = ObjectId(current_user.id)
        
        # Update notification settings
        result = await db.users.update_one(
            {"_id": user_id},
            {"$set": {
                "impo-noti": notification_settings.emailNotifications,
                "trend-noti": notification_settings.trendAlerts,
                "update-noti": notification_settings.productUpdates,
                "search-report": notification_settings.marketResearch,
                "updated_at": datetime.utcnow()
            }}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update notification settings"
            )
        
        # Get updated user
        updated_user = await db.users.find_one({"_id": user_id})
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found after update"
            )
            
        updated_user["_id"] = str(updated_user["_id"])
        return UserResponse(**updated_user)
        
    except Exception as e:
        logger.error(f"Error updating notification settings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error updating notification settings: {str(e)}"
        )

@router.post("/me/change-password", response_model=UserResponse)
async def change_password(
    password_change: PasswordChange,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Change user password
    
    Args:
        password_change: Password change data
        current_user: Current authenticated user
        
    Returns:
        UserResponse: Updated user data
    """
    db = MongoDB.get_database()
    
    try:
        user_id = ObjectId(current_user.id)
        
        # Verify current password
        user = await db.users.find_one({"_id": user_id})
        if not user or not verify_password(password_change.current_password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Current password is incorrect"
            )
        
        # Update password
        result = await db.users.update_one(
            {"_id": user_id},
            {"$set": {
                "password": get_password_hash(password_change.new_password),
                "updated_at": datetime.utcnow()
            }}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update password"
            )
        
        # Get updated user
        updated_user = await db.users.find_one({"_id": user_id})
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found after update"
            )
            
        updated_user["_id"] = str(updated_user["_id"])
        return UserResponse(**updated_user)
        
    except Exception as e:
        logger.error(f"Error changing password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error changing password: {str(e)}"
        )