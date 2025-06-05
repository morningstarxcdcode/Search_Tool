from fastapi import APIRouter, Depends, HTTPException, status
from ...schemas.user import UserResponse, UserInDB
from ...utils.auth import get_current_active_user
from ...db.mongodb import MongoDB
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.post("/increment-search-count")
async def increment_search_count(
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Increment the search count for the current user
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        dict: Updated user data
    """
    db = MongoDB.get_database()
    
    try:
        # Convert string ID to ObjectId for MongoDB query
        user_id = ObjectId(current_user.id)
        
        # Update user document to increment search count
        result = await db.users.update_one(
            {"_id": user_id},
            {
                "$inc": {"searchCount": 1},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to increment search count"
            )
        
        # Get updated user
        updated_user = await db.users.find_one({"_id": user_id})
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found after update"
            )
            
        updated_user["_id"] = str(updated_user["_id"])
        
        return {"message": "Search count incremented successfully", "user": updated_user}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error incrementing search count: {str(e)}"
        ) 