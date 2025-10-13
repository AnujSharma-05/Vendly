from fastapi import APIRouter, Depends
from .. import schemas
from .auth import get_current_user 
from typing import Annotated

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/me", response_model=schemas.UserOut)
async def read_users_me(current_user: Annotated[schemas.UserOut, Depends(get_current_user)]):
    """
    Fetches the profile of the currently logged-in user.
    """
    return current_user