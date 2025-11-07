from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated, List
from bson import ObjectId
from datetime import datetime, timezone

from .. import schemas
from .auth import get_current_client_user
from ..db.mongodb import AuctionCollection, ClientProfileCollection
from ..core.enums import ClientProfileStatus, AuctionStatus


router = APIRouter(
    prefix="/client",
    tags=["Client"],
    dependencies=[Depends(get_current_client_user)]
)

@router.get("/profile", response_model=schemas.ClientProfileOut)
async def get_client_profile(
    current_user: Annotated[schemas.UserOut, Depends(get_current_client_user)]
):
    """
    Get the current client's profile information including approval status
    """
    client_profile = await ClientProfileCollection.find_one(
        {"user_id": current_user.id}  # user_id is stored as string
    )
    
    if client_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client profile not found"
        )
    
    # user_id is already a string, no conversion needed
    return schemas.ClientProfileOut(**client_profile)

@router.get("/auctions", response_model=List[schemas.AuctionOut])
async def get_my_auctions(
    current_user: Annotated[schemas.UserOut, Depends(get_current_client_user)]
):
    """
    Get all auctions created by the current client
    """
    # Find all auctions where host_id matches current user's id
    auctions_cursor = AuctionCollection.find({"host_id": current_user.id})
    auctions = await auctions_cursor.to_list(length=100)
    
    return [schemas.AuctionOut(**auction) for auction in auctions]

@router.post("/auctions", response_model=schemas.AuctionOut, status_code=status.HTTP_201_CREATED)
async def create_auction(
    auction_data: schemas.AuctionCreate,
    current_user: Annotated[schemas.UserOut, Depends(get_current_client_user)]
):
    """
    Create a new auction. Only approved clients can create auctions.
    """
    # Check if client is approved
    client_profile = await ClientProfileCollection.find_one(
        {"user_id": current_user.id}  # user_id is stored as string
    )
    
    if client_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client profile not found"
        )
    
    if client_profile.get("status") != ClientProfileStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only approved clients can create auctions. Your current status is: " + client_profile.get("status")
        )
    
    # Validate times
    if auction_data.start_time >= auction_data.end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be after start time"
        )
    
    # Use timezone-aware datetime for comparison
    now_utc = datetime.now(timezone.utc)
    if auction_data.start_time < now_utc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start time must be in the future"
        )
    
    # Create auction document
    auction_dict = auction_data.model_dump()
    auction_dict["host_id"] = current_user.id  # Store as string to match user_id format
    auction_dict["status"] = AuctionStatus.SCHEDULED
    
    # Insert into database
    result = await AuctionCollection.insert_one(auction_dict)
    
    # Fetch the created auction
    created_auction = await AuctionCollection.find_one({"_id": result.inserted_id})
    
    return schemas.AuctionOut(**created_auction)