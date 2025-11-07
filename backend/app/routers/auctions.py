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
    
    return [schemas.AuctionOut(**auction) for auction in auctions]


@router.get("/{auction_id}", response_model=schemas.AuctionOut)
async def get_public_auction_details(auction_id: str):
    """
    Get details of a specific auction by ID. Anyone can access this endpoint.
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
    
    return schemas.AuctionOut(**auction)


@router.get("/{auction_id}/items", response_model=List[schemas.AuctionItemOut])
async def get_public_auction_items(auction_id: str):
    """
    Get all items for a specific auction. Anyone can access this endpoint.
    Only returns items for active or scheduled auctions.
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
    items_cursor = AuctionItemCollection.find({"auction_id": auction_id}).limit(1000)
    items = await items_cursor.to_list(length=1000)
    
    return [schemas.AuctionItemOut(**item) for item in items]
