#this file has all the admin specific endpoints

from fastapi import APIRouter, Depends, HTTPException, status
from  typing import List, Annotated
from bson import ObjectId
from .. import schemas
from .auth import get_current_admin_user
from ..db.mongodb import ClientProfileCollection, UserCollection

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(get_current_admin_user)] #this is the main dependency which protects all the routes in this file
)

@router.get("/clients/pending", response_model=List[schemas.ClientProfileOut])
async def get_pending_clients():
    #goal is that admin can approve a client, change thier profile status to "approved" but the admin access is required

    pending_profiles_cursor = ClientProfileCollection.find(
        {"status": ClientProfileCollection.PENDING_APPROVAL}
    )

    # converting the cursor in list of dict
    pending_profiles = await pending_profiles_cursor.to_list(length=100) #can change the limit afterwards too
    
    
    
    return [schemas.ClientProfileOut(**profile) for profile in pending_profiles]

@router.post("/clients/{user_id}/approve", response_model=schemas.ClientProfileOut)
async def approve_client(user_id: str):
    # Admin can approve a client profile by changing its status to "APPROVED"
    try: 
        #convert the user_id to mongodb ObjectId
        object_user_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=400, detail="Invalid user id format"
        )
    updated_profile = await ClientProfileCollection.find_one_and_update(
        {"user_id": object_user_id},
        {"$set": {"status": ClientProfileCollection.APPROVED}},
        return_document= True #getting document after update
        )
    
    if updated_profile is None:
        raise HTTPException(status_code=404, detail=f"client profile for ID {user_id} not found")
    
    return schemas.ClientProfileOut(**updated_profile)
