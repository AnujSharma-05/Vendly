"""
Auction Items Router
Handles CRUD operations for auction items (client-only endpoints)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated, List
from bson import ObjectId
from datetime import datetime

from .. import schemas
from .auth import get_current_client_user
from ..db.mongodb import AuctionCollection, AuctionItemCollection
from ..core.enums import AuctionStatus, ItemStatus


router = APIRouter(
    prefix="/client/auctions",
    tags=["Auction Items"],
    dependencies=[Depends(get_current_client_user)]
)


@router.post("/{auction_id}/items", response_model=schemas.AuctionItemOut, status_code=status.HTTP_201_CREATED)
async def add_auction_item(
    auction_id: str,
    item: schemas.AuctionItemCreate,
    current_user: Annotated[schemas.UserOut, Depends(get_current_client_user)]
):
    """
    Add a single item to an auction.
    
    Requirements:
    - Auction must exist and belong to the current client
    - Auction must be in 'scheduled' status (not yet started)
    """
    
    # Verify auction exists and belongs to current user
    try:
        auction = await AuctionCollection.find_one({
            "_id": ObjectId(auction_id),
            "host_id": current_user.id
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid auction ID format"
        )
    
    if not auction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction not found or you don't have permission to add items"
        )
    
    # Check if auction is still in scheduled status (can only add items before auction starts)
    if auction.get("status") not in [AuctionStatus.SCHEDULED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot add items to auction with status '{auction.get('status')}'. Items can only be added to scheduled auctions."
        )
    
    # Create item document
    item_doc = {
        "auction_id": auction_id,
        "name": item.name,
        "description": item.description,
        "base_price": item.base_price,
        "category": item.category,
        "image_urls": item.image_urls,
        "created_at": datetime.utcnow(),
        # Bidding fields (for future use)
        "current_bid": None,
        "bid_count": 0,
        "winner_id": None,
        "status": ItemStatus.PENDING
    }
    
    # Insert into database
    result = await AuctionItemCollection.insert_one(item_doc)
    
    # Fetch the created item to return
    created_item = await AuctionItemCollection.find_one({"_id": result.inserted_id})
    
    return schemas.AuctionItemOut(**created_item)


@router.get("/{auction_id}/items", response_model=List[schemas.AuctionItemOut])
async def get_auction_items(
    auction_id: str,
    current_user: Annotated[schemas.UserOut, Depends(get_current_client_user)]
):
    """
    Get all items for a specific auction.
    
    Requirements:
    - Auction must exist and belong to the current client
    """
    
    # Verify auction exists and belongs to current user
    try:
        auction = await AuctionCollection.find_one({
            "_id": ObjectId(auction_id),
            "host_id": current_user.id
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid auction ID format"
        )
    
    if not auction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction not found or you don't have permission to view items"
        )
    
    # Fetch all items for this auction
    items_cursor = AuctionItemCollection.find({"auction_id": auction_id})
    items = await items_cursor.to_list(length=1000)  # Max 1000 items per auction
    
    return [schemas.AuctionItemOut(**item) for item in items]


@router.put("/{auction_id}/items/{item_id}", response_model=schemas.AuctionItemOut)
async def update_auction_item(
    auction_id: str,
    item_id: str,
    item_update: schemas.AuctionItemUpdate,
    current_user: Annotated[schemas.UserOut, Depends(get_current_client_user)]
):
    """
    Update an auction item.
    
    Requirements:
    - Auction must exist and belong to the current client
    - Auction must be in 'scheduled' status
    - Item must exist and belong to the auction
    """
    
    # Verify auction ownership
    try:
        auction = await AuctionCollection.find_one({
            "_id": ObjectId(auction_id),
            "host_id": current_user.id
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid auction ID format"
        )
    
    if not auction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction not found or you don't have permission"
        )
    
    # Only allow updates to scheduled auctions
    if auction.get("status") not in [AuctionStatus.SCHEDULED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot update items in auction with status '{auction.get('status')}'. Items can only be updated in scheduled auctions."
        )
    
    # Build update dict (only include fields that were actually provided)
    update_data = item_update.model_dump(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided to update"
        )
    
    # Update the item
    try:
        updated_item = await AuctionItemCollection.find_one_and_update(
            {
                "_id": ObjectId(item_id),
                "auction_id": auction_id  # Ensure item belongs to this auction
            },
            {"$set": update_data},
            return_document=True  # Return the updated document
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid item ID format"
        )
    
    if not updated_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in this auction"
        )
    
    return schemas.AuctionItemOut(**updated_item)


@router.delete("/{auction_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_auction_item(
    auction_id: str,
    item_id: str,
    current_user: Annotated[schemas.UserOut, Depends(get_current_client_user)]
):
    """
    Delete an auction item.
    
    Requirements:
    - Auction must exist and belong to the current client
    - Auction must be in 'scheduled' status
    - Item must exist and belong to the auction
    """
    
    # Verify auction ownership
    try:
        auction = await AuctionCollection.find_one({
            "_id": ObjectId(auction_id),
            "host_id": current_user.id
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid auction ID format"
        )
    
    if not auction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction not found or you don't have permission"
        )
    
    # Only allow deletion from scheduled auctions
    if auction.get("status") not in [AuctionStatus.SCHEDULED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete items from auction with status '{auction.get('status')}'. Items can only be deleted from scheduled auctions."
        )
    
    # Delete the item
    try:
        delete_result = await AuctionItemCollection.delete_one({
            "_id": ObjectId(item_id),
            "auction_id": auction_id  # Ensure item belongs to this auction
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid item ID format"
        )
    
    if delete_result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in this auction"
        )
    
    return None  # 204 No Content response
