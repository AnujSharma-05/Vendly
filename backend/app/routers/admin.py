#this file has all the admin specific endpoints

from fastapi import APIRouter, Depends, HTTPException, status
from  typing import List, Annotated
from bson import ObjectId
from pymongo import ReturnDocument
from .. import schemas
from .auth import get_current_admin_user
from ..db.mongodb import ClientProfileCollection, UserCollection
from ..core.enums import ClientProfileStatus

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(get_current_admin_user)] #this is the main dependency which protects all the routes in this file
)

@router.get("/clients/pending", response_model=List[schemas.ClientProfileWithUserOut])
async def get_pending_clients():
    #goal is that admin can approve a client, change thier profile status to "approved" but the admin access is required

    pending_profiles_cursor = ClientProfileCollection.find(
        {"status": ClientProfileStatus.PENDING_APPROVAL}
    )

    # converting the cursor in list of dict
    pending_profiles = await pending_profiles_cursor.to_list(length=100) #can change the limit afterwards too
    
    # Fetch user information for each profile and combine
    result = []
    for profile in pending_profiles:
        profile["user_id"] = str(profile["user_id"])
        
        # Fetch user details
        user = await UserCollection.find_one({"_id": ObjectId(profile["user_id"])})
        if user:
            profile["username"] = user.get("username")
            profile["email"] = user.get("email")
        
        result.append(schemas.ClientProfileWithUserOut(**profile))
    
    return result

@router.post("/clients/{user_id}/approve", response_model=schemas.ClientProfileOut)
async def approve_client(user_id: str):
    # Admin can approve a client profile by changing its status to "APPROVED"
    # Note: user_id is stored as a string in client_profiles collection
    
    updated_profile = await ClientProfileCollection.find_one_and_update(
        {"user_id": user_id},  # Query by string user_id, not ObjectId
        {"$set": {"status": ClientProfileStatus.APPROVED}},
        return_document=ReturnDocument.AFTER #getting document after update
        )
    
    if updated_profile is None:
        raise HTTPException(status_code=404, detail=f"client profile for user ID {user_id} not found")
    
    # user_id is already a string, no need to convert
    
    return schemas.ClientProfileOut(**updated_profile)

@router.post("/clients/{user_id}/reject", response_model=schemas.ClientProfileOut)
async def reject_client(user_id: str):
    # Admin can reject a client profile by changing its status to "SUSPENDED"
    # Note: user_id is stored as a string in client_profiles collection
    
    updated_profile = await ClientProfileCollection.find_one_and_update(
        {"user_id": user_id},  # Query by string user_id, not ObjectId
        {"$set": {"status": ClientProfileStatus.SUSPENDED}},
        return_document=ReturnDocument.AFTER #getting document after update
        )
    
    if updated_profile is None:
        raise HTTPException(status_code=404, detail=f"client profile for user ID {user_id} not found")
    
    # user_id is already a string, no need to convert
    
    return schemas.ClientProfileOut(**updated_profile)
