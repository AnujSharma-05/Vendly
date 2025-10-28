from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated

from .. import schemas
from .auth import get_current_client_user
from ..db.mongodb import AuctionCollection, ClientProfileCollection
from ..core.enums import ClientProfileStatus


router = APIRouter(
    prefix="/client",
    tags=["Client"],
    dependencies=[Depends(get_current_client_user)]
)

@router.post("/auctions", response_model=schemas.AuctionOut, status_code=status.HTTP_201_CREATED)

async def create_auction(
    auction_data: schemas.AuctionCreate,
    current_user: Annotated[schemas.UserOut, Depends(get_current_client_user)] #observe the Dependecy here
):
    #according to the flow, to create a new room the client identity needs to be approved, this is that step

    client_profile = await ClientProfileCollection.find_one(
        {"user_id": ObjectId(current_client.id)}
        )

        

    return {}