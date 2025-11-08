from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated, List
from bson import ObjectId
from datetime import datetime, timezone

from .. import schemas
from .auth import get_current_user
from ..db.mongodb import (
    ParticipantRegistrationCollection,
    BidCollection,
    AuctionCollection,
    AuctionItemCollection
)
from ..core.enums import UserRole, AuctionStatus, ItemStatus


# Dependency to ensure user is a participant
async def get_current_participant_user(
    current_user: Annotated[schemas.UserOut, Depends(get_current_user)]
):
    if current_user.role != UserRole.PARTICIPANT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User has no privilege to access this resource."
        )
    return current_user


router = APIRouter(
    prefix="/participant",
    tags=["Participant"],
    dependencies=[Depends(get_current_participant_user)]
)


@router.get("/stats", response_model=schemas.ParticipantStatsOut)
async def get_participant_stats(
    current_user: Annotated[schemas.UserOut, Depends(get_current_participant_user)]
):
    """
    Get dashboard statistics for the current participant.
    Returns: active auctions count, won items, total spent, active bids
    """
    user_id = current_user.id
    
    # Count active auctions (registrations with status "active")
    active_auctions_count = await ParticipantRegistrationCollection.count_documents({
        "user_id": user_id,
        "status": "active"
    })
    
    # Get total items won and total spent from all registrations
    registrations_cursor = ParticipantRegistrationCollection.find({"user_id": user_id})
    registrations = await registrations_cursor.to_list(length=None)
    
    total_won = sum(reg.get("items_won", 0) for reg in registrations)
    total_spent = sum(reg.get("total_spent", 0.0) for reg in registrations)
    
    # Count active bids (bids that are still winning)
    active_bids_count = await BidCollection.count_documents({
        "user_id": user_id,
        "is_winning": True
    })
    
    return schemas.ParticipantStatsOut(
        active_auctions=active_auctions_count,
        won_items=total_won,
        total_spent=total_spent,
        active_bids=active_bids_count
    )


@router.get("/auctions", response_model=List[schemas.ParticipantAuctionOut])
async def get_my_auctions(
    current_user: Annotated[schemas.UserOut, Depends(get_current_participant_user)]
):
    """
    Get all auctions the participant has joined.
    Returns auctions with participant-specific data (bids, wins, spending).
    """
    user_id = current_user.id
    
    # Find all registrations for this user
    registrations_cursor = ParticipantRegistrationCollection.find({"user_id": user_id})
    registrations = await registrations_cursor.to_list(length=None)
    
    if not registrations:
        return []
    
    # Get all auction IDs
    auction_ids = [ObjectId(reg["auction_id"]) for reg in registrations]
    
    # Fetch all auctions
    auctions_cursor = AuctionCollection.find({"_id": {"$in": auction_ids}})
    auctions = await auctions_cursor.to_list(length=None)
    
    # Build response with participant-specific data
    result = []
    for auction in auctions:
        auction_id_str = str(auction["_id"])
        
        # Find registration for this auction
        registration = next((r for r in registrations if r["auction_id"] == auction_id_str), None)
        
        if not registration:
            continue
        
        # Count bids in this auction
        my_bids_count = await BidCollection.count_documents({
            "user_id": user_id,
            "auction_id": auction_id_str
        })
        
        # Calculate remaining budget
        spending_limit = auction.get("spending_limit", 0.0)
        my_spent = registration.get("total_spent", 0.0)
        my_remaining = max(0.0, spending_limit - my_spent) if spending_limit > 0 else 0.0
        
        # Create ParticipantAuctionOut
        auction_data = schemas.AuctionOut(**auction)
        participant_auction = schemas.ParticipantAuctionOut(
            **auction_data.model_dump(),
            my_bids_count=my_bids_count,
            my_won_items=registration.get("items_won", 0),
            my_spent=my_spent,
            my_remaining_budget=my_remaining
        )
        
        result.append(participant_auction)
    
    # Sort by auction start time (most recent first)
    result.sort(key=lambda x: x.start_time, reverse=True)
    
    return result


@router.get("/bids", response_model=List[schemas.BidOut])
async def get_my_active_bids(
    current_user: Annotated[schemas.UserOut, Depends(get_current_participant_user)]
):
    """
    Get all active/winning bids for the current participant.
    Returns only bids where is_winning=True.
    """
    user_id = current_user.id
    
    bids_cursor = BidCollection.find({
        "user_id": user_id,
        "is_winning": True
    }).sort("placed_at", -1)  # Most recent first
    
    bids = await bids_cursor.to_list(length=100)
    
    return [schemas.BidOut(**bid) for bid in bids]


@router.get("/wins", response_model=List[schemas.BidOut])
async def get_my_won_items(
    current_user: Annotated[schemas.UserOut, Depends(get_current_participant_user)]
):
    """
    Get all items won by the current participant.
    Returns winning bids from completed auctions.
    """
    user_id = current_user.id
    
    # Get all completed auctions where user participated
    registrations_cursor = ParticipantRegistrationCollection.find({"user_id": user_id})
    registrations = await registrations_cursor.to_list(length=None)
    
    if not registrations:
        return []
    
    auction_ids = [ObjectId(reg["auction_id"]) for reg in registrations]
    
    # Find completed auctions
    completed_auctions_cursor = AuctionCollection.find({
        "_id": {"$in": auction_ids},
        "status": AuctionStatus.COMPLETED
    })
    completed_auctions = await completed_auctions_cursor.to_list(length=None)
    
    if not completed_auctions:
        return []
    
    completed_auction_ids = [str(a["_id"]) for a in completed_auctions]
    
    # Get winning bids from completed auctions
    winning_bids_cursor = BidCollection.find({
        "user_id": user_id,
        "auction_id": {"$in": completed_auction_ids},
        "is_winning": True
    }).sort("placed_at", -1)
    
    winning_bids = await winning_bids_cursor.to_list(length=100)
    
    return [schemas.BidOut(**bid) for bid in winning_bids]


@router.get("/history", response_model=List[schemas.BidOut])
async def get_bid_history(
    current_user: Annotated[schemas.UserOut, Depends(get_current_participant_user)]
):
    """
    Get complete bid history for the current participant.
    Returns all bids (winning and non-winning) sorted by date.
    """
    user_id = current_user.id
    
    bids_cursor = BidCollection.find({"user_id": user_id}).sort("placed_at", -1)
    bids = await bids_cursor.to_list(length=200)
    
    return [schemas.BidOut(**bid) for bid in bids]


@router.get("/auctions/{auction_id}/registration-status")
async def check_registration_status(
    auction_id: str,
    current_user: Annotated[schemas.UserOut, Depends(get_current_participant_user)]
):
    """
    Check if the current participant is registered for a specific auction.
    Returns {"is_registered": true/false, "registration": {...} or null}
    """
    user_id = current_user.id
    
    # Validate ObjectId format
    if not ObjectId.is_valid(auction_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid auction ID format"
        )
    
    # Check if registration exists
    registration = await ParticipantRegistrationCollection.find_one({
        "auction_id": auction_id,  # auction_id is stored as string, not ObjectId
        "user_id": user_id
    })
    
    return {
        "is_registered": registration is not None,
        "registration": schemas.ParticipantRegistrationOut(**registration) if registration else None
    }


@router.post("/auctions/{auction_id}/join", response_model=schemas.ParticipantRegistrationOut, status_code=status.HTTP_201_CREATED)
async def join_auction(
    auction_id: str,
    current_user: Annotated[schemas.UserOut, Depends(get_current_participant_user)]
):
    """
    Join/register for an auction.
    Validates: auction exists, is scheduled/live, not full, user not already joined.
    """
    user_id = current_user.id
    
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
    
    # Check if auction is joinable (scheduled or live)
    auction_status = auction.get("status")
    if auction_status not in [AuctionStatus.SCHEDULED, AuctionStatus.ACTIVE]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot join auction with status: {auction_status}"
        )
    
    # Check if user already joined
    existing_registration = await ParticipantRegistrationCollection.find_one({
        "auction_id": auction_id,
        "user_id": user_id
    })
    
    if existing_registration:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already joined this auction"
        )
    
    # Check if auction is full
    max_participants = auction.get("max_participants", 0)
    if max_participants > 0:
        current_participants = await ParticipantRegistrationCollection.count_documents({
            "auction_id": auction_id,
            "status": "active"
        })
        
        if current_participants >= max_participants:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Auction is full"
            )
    
    # Create registration
    registration_dict = {
        "auction_id": auction_id,
        "user_id": user_id,
        "joined_at": datetime.now(timezone.utc),
        "status": "active",
        "total_spent": 0.0,
        "items_won": 0
    }
    
    result = await ParticipantRegistrationCollection.insert_one(registration_dict)
    created_registration = await ParticipantRegistrationCollection.find_one({"_id": result.inserted_id})
    
    return schemas.ParticipantRegistrationOut(**created_registration)


@router.delete("/auctions/{auction_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
async def leave_auction(
    auction_id: str,
    current_user: Annotated[schemas.UserOut, Depends(get_current_participant_user)]
):
    """
    Leave an auction (before it starts or goes live).
    Can only leave scheduled auctions.
    """
    user_id = current_user.id
    
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
    
    # Can only leave scheduled auctions
    if auction.get("status") != AuctionStatus.SCHEDULED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only leave auctions that haven't started yet"
        )
    
    # Find registration
    registration = await ParticipantRegistrationCollection.find_one({
        "auction_id": auction_id,
        "user_id": user_id
    })
    
    if registration is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You are not registered for this auction"
        )
    
    # Update status to "left"
    await ParticipantRegistrationCollection.update_one(
        {"_id": registration["_id"]},
        {"$set": {"status": "left"}}
    )
    
    return None


@router.post("/items/{item_id}/bid", response_model=schemas.BidOut, status_code=status.HTTP_201_CREATED)
async def place_bid(
    item_id: str,
    bid_data: schemas.BidCreate,
    current_user: Annotated[schemas.UserOut, Depends(get_current_participant_user)]
):
    """
    Place a bid on an auction item.
    Validates: item exists, auction is live, user joined auction, bid > current highest, within budget.
    """
    user_id = current_user.id
    
    # Validate ObjectId format
    if not ObjectId.is_valid(item_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid item ID format"
        )
    
    # Find item
    item = await AuctionItemCollection.find_one({"_id": ObjectId(item_id)})
    
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    
    auction_id = item.get("auction_id")
    
    # Find auction
    auction = await AuctionCollection.find_one({"_id": ObjectId(auction_id)})
    
    if auction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction not found"
        )
    
    # Auction must be live
    if auction.get("status") != AuctionStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Auction is not currently live"
        )
    
    # Item must be available (pending or active status)
    if item.get("status") not in [ItemStatus.PENDING, ItemStatus.ACTIVE]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Item is not available for bidding. Status: {item.get('status')}"
        )
    
    # Check if user joined this auction
    registration = await ParticipantRegistrationCollection.find_one({
        "auction_id": auction_id,
        "user_id": user_id,
        "status": "active"
    })
    
    if registration is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must join the auction before placing bids"
        )
    
    # Check if bid amount > base price
    base_price = item.get("base_price", 0.0)
    if bid_data.amount <= base_price:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bid amount must be greater than base price ({base_price})"
        )
    
    # Find current highest bid
    highest_bid = await BidCollection.find_one(
        {"item_id": item_id},
        sort=[("amount", -1)]
    )
    
    if highest_bid:
        if bid_data.amount <= highest_bid.get("amount", 0.0):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Bid amount must be greater than current highest bid ({highest_bid.get('amount')})"
            )
    
    # Check spending limit
    spending_limit = auction.get("spending_limit", 0.0)
    if spending_limit > 0:
        total_spent = registration.get("total_spent", 0.0)
        if total_spent + bid_data.amount > spending_limit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Bid exceeds your remaining budget. Spent: {total_spent}, Limit: {spending_limit}"
            )
    
    # Create bid
    bid_dict = {
        "auction_id": auction_id,
        "item_id": item_id,
        "user_id": user_id,
        "amount": bid_data.amount,
        "placed_at": datetime.now(timezone.utc),
        "is_winning": True  # New bid is winning
    }
    
    # Mark previous winning bid as not winning
    if highest_bid:
        await BidCollection.update_one(
            {"_id": highest_bid["_id"]},
            {"$set": {"is_winning": False}}
        )
    
    # Insert new bid
    result = await BidCollection.insert_one(bid_dict)
    created_bid = await BidCollection.find_one({"_id": result.inserted_id})
    
    # Update item's current_bid and bid_count
    current_bid_count = item.get("bid_count", 0)
    await AuctionItemCollection.update_one(
        {"_id": ObjectId(item_id)},
        {
            "$set": {
                "current_bid": bid_data.amount,
                "bid_count": current_bid_count + 1,
                "status": ItemStatus.ACTIVE  # Mark item as active when first bid is placed
            }
        }
    )
    
    return schemas.BidOut(**created_bid)
