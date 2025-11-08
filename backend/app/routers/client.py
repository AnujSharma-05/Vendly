from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated, List
from bson import ObjectId
from datetime import datetime, timezone

from .. import schemas
from .auth import get_current_client_user
from ..db.mongodb import (
    AuctionCollection, 
    ClientProfileCollection, 
    AuctionItemCollection,
    ParticipantRegistrationCollection,
    BidCollection
)
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

@router.get("/auctions/{auction_id}", response_model=schemas.AuctionOut)
async def get_auction(
    auction_id: str,
    current_user: Annotated[schemas.UserOut, Depends(get_current_client_user)]
):
    """
    Get a single auction by ID. Only the auction host can view it.
    """
    # Validate ObjectId format
    if not ObjectId.is_valid(auction_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid auction ID format"
        )
    
    # Find auction
    auction = await AuctionCollection.find_one({"_id": ObjectId(auction_id)})
    
    if auction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction not found"
        )
    
    # Verify ownership
    if auction.get("host_id") != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own auctions"
        )
    
    return schemas.AuctionOut(**auction)

@router.put("/auctions/{auction_id}", response_model=schemas.AuctionOut)
async def update_auction(
    auction_id: str,
    update_data: schemas.AuctionUpdate,
    current_user: Annotated[schemas.UserOut, Depends(get_current_client_user)]
):
    """
    Update an auction. Only scheduled auctions can be updated.
    Only the auction host can update it.
    """
    # Validate ObjectId format
    if not ObjectId.is_valid(auction_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid auction ID format"
        )
    
    # Find auction
    auction = await AuctionCollection.find_one({"_id": ObjectId(auction_id)})
    
    if auction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction not found"
        )
    
    # Verify ownership
    if auction.get("host_id") != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own auctions"
        )
    
    # Only scheduled auctions can be updated
    if auction.get("status") != AuctionStatus.SCHEDULED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only scheduled auctions can be updated. Current status: {auction.get('status')}"
        )
    
    # Prepare update data (only include non-None values)
    update_dict = update_data.model_dump(exclude_unset=True)
    
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No update data provided"
        )
    
    # Validate times if they are being updated
    start_time = update_dict.get("start_time", auction.get("start_time"))
    end_time = update_dict.get("end_time", auction.get("end_time"))
    
    if start_time >= end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be after start time"
        )
    
    # Check if start time is in the future (only if being updated)
    if "start_time" in update_dict:
        now_utc = datetime.now(timezone.utc)
        if update_dict["start_time"] < now_utc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Start time must be in the future"
            )
    
    # Update auction
    result = await AuctionCollection.update_one(
        {"_id": ObjectId(auction_id)},
        {"$set": update_dict}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update auction"
        )
    
    # Fetch updated auction
    updated_auction = await AuctionCollection.find_one({"_id": ObjectId(auction_id)})
    
    return schemas.AuctionOut(**updated_auction)


@router.delete("/auctions/{auction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_auction(
    auction_id: str,
    current_user: Annotated[schemas.UserOut, Depends(get_current_client_user)]
):
    """
    Delete an auction. Only scheduled or finished auctions can be deleted.
    Active auctions cannot be deleted to protect ongoing bidding.
    Only the auction host can delete it.
    Also deletes all associated items, registrations, and bids.
    """
    # Validate ObjectId format
    if not ObjectId.is_valid(auction_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid auction ID format"
        )
    
    # Find auction
    auction = await AuctionCollection.find_one({"_id": ObjectId(auction_id)})
    
    if auction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction not found"
        )
    
    # Verify ownership
    if auction.get("host_id") != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own auctions"
        )
    
    # Only scheduled or finished auctions can be deleted
    auction_status = auction.get("status")
    if auction_status not in [AuctionStatus.SCHEDULED, AuctionStatus.FINISHED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete {auction_status} auctions. Only scheduled or finished auctions can be deleted."
        )
    
    # Delete associated data in order
    # 1. Delete all bids for items in this auction
    await BidCollection.delete_many({"auction_id": auction_id})
    
    # 2. Delete all participant registrations
    await ParticipantRegistrationCollection.delete_many({"auction_id": auction_id})
    
    # 3. Delete all auction items
    await AuctionItemCollection.delete_many({"auction_id": auction_id})
    
    # 4. Finally, delete the auction itself
    delete_result = await AuctionCollection.delete_one({"_id": ObjectId(auction_id)})
    
    if delete_result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete auction"
        )
    
    return None  # 204 No Content response