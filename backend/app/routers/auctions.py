from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, timezone

from .. import schemas
from ..db.mongodb import AuctionCollection, AuctionItemCollection
from ..core.enums import AuctionStatus
from bson import ObjectId


router = APIRouter(
    prefix="/auctions",
    tags=["Public Auctions"]
)


@router.get("", response_model=List[schemas.AuctionOut])
async def get_public_auctions(
    status: Optional[str] = Query(None, description="Filter by status: scheduled, active, finished"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of auctions to return")
):
    """
    Get all public auctions. Anyone can access this endpoint.
    Optionally filter by status (scheduled, active, finished).
    Automatically updates auction statuses based on current time.
    """
    # Build query filter
    query_filter = {}
    
    if status:
        # Validate status
        valid_statuses = ["scheduled", "active", "finished"]
        if status.lower() not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        query_filter["status"] = status.lower()
    
    # Fetch auctions
    auctions_cursor = AuctionCollection.find(query_filter).sort("start_time", -1).limit(limit)
    auctions = await auctions_cursor.to_list(length=limit)
    
    # Auto-update auction statuses based on current time
    now = datetime.now(timezone.utc)
    updated_auctions = []
    
    for auction in auctions:
        start_time = auction.get("start_time")
        end_time = auction.get("end_time")
        current_status = auction.get("status")
        
        # Convert to datetime if they're strings and make timezone-aware
        if isinstance(start_time, str):
            start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        elif isinstance(start_time, datetime) and start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=timezone.utc)
        
        if isinstance(end_time, str):
            end_time = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
        elif isinstance(end_time, datetime) and end_time.tzinfo is None:
            end_time = end_time.replace(tzinfo=timezone.utc)
        
        # Update status if needed
        if current_status == AuctionStatus.SCHEDULED and start_time and now >= start_time:
            # Auction should be active now
            await AuctionCollection.update_one(
                {"_id": auction["_id"]},
                {"$set": {"status": AuctionStatus.ACTIVE}}
            )
            auction["status"] = AuctionStatus.ACTIVE
        elif current_status == AuctionStatus.ACTIVE and end_time and now >= end_time:
            # Auction should be finished now
            await AuctionCollection.update_one(
                {"_id": auction["_id"]},
                {"$set": {"status": AuctionStatus.FINISHED}}
            )
            auction["status"] = AuctionStatus.FINISHED
        
        updated_auctions.append(auction)
    
    return [schemas.AuctionOut(**auction) for auction in updated_auctions]


@router.get("/{auction_id}", response_model=schemas.AuctionOut)
async def get_public_auction_details(auction_id: str):
    """
    Get details of a specific auction by ID. Anyone can access this endpoint.
    Automatically updates auction status based on current time.
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
    
    # Auto-update auction status based on current time
    now = datetime.now(timezone.utc)
    start_time = auction.get("start_time")
    end_time = auction.get("end_time")
    current_status = auction.get("status")
    
    updated = False
    
    # Convert to datetime if they're strings and make timezone-aware
    if isinstance(start_time, str):
        start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
    elif isinstance(start_time, datetime) and start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=timezone.utc)
    
    if isinstance(end_time, str):
        end_time = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
    elif isinstance(end_time, datetime) and end_time.tzinfo is None:
        end_time = end_time.replace(tzinfo=timezone.utc)
    
    # Update status if needed
    if current_status == AuctionStatus.SCHEDULED and start_time and now >= start_time:
        # Auction should be active now
        await AuctionCollection.update_one(
            {"_id": ObjectId(auction_id)},
            {"$set": {"status": AuctionStatus.ACTIVE}}
        )
        auction["status"] = AuctionStatus.ACTIVE
        updated = True
    elif current_status == AuctionStatus.ACTIVE and end_time and now >= end_time:
        # Auction should be finished now
        await AuctionCollection.update_one(
            {"_id": ObjectId(auction_id)},
            {"$set": {"status": AuctionStatus.FINISHED}}
        )
        auction["status"] = AuctionStatus.FINISHED
        updated = True
    
    return schemas.AuctionOut(**auction)


@router.get("/{auction_id}/items", response_model=List[schemas.AuctionItemOut])
async def get_public_auction_items(auction_id: str):
    """
    Get all items for a specific auction. Anyone can access this endpoint.
    Returns items with current highest bid information.
    """
    # Validate ObjectId format
    if not ObjectId.is_valid(auction_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid auction ID format"
        )
    
    # Verify auction exists and is public
    auction = await AuctionCollection.find_one({"_id": ObjectId(auction_id)})
    
    if auction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction not found"
        )
    
    # Fetch all items for this auction
    # Note: current_bid and bid_count are now stored directly on items
    # and updated when bids are placed, so no need to query BidCollection
    items_cursor = AuctionItemCollection.find({"auction_id": auction_id}).limit(1000)
    items = await items_cursor.to_list(length=1000)
    
    return [schemas.AuctionItemOut(**item) for item in items]
