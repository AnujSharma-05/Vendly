from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
from .core import enums # Import our new enums

# ==================================
#         User & Auth

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=50)
    role: enums.UserRole = enums.UserRole.PARTICIPANT #participant by default

class UserOut(UserBase):
    id: int # this would be a UUID or ObjectId string after connection to DB
    role: enums.UserRole
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True
        
# ==================================


# ==================================
#         Client Profile

class ClientProfileOut(BaseModel):
    user_id: int
    company_name: Optional[str]
    status: enums.ClientProfileStatus
    
    class Config:
        from_attributes = True

# ==================================
# ==================================
#      Auction & Related Items
class AuctionConfig(BaseModel):
    max_participants: int
    entry_mode: enums.AuctionEntryMode
    participant_spending_limit: float
    allow_anonymous_spectators: bool = False

class AuctionCreate(BaseModel):
    title: str = Field(..., max_length=100)
    description: str
    start_time: datetime
    end_time: datetime
    config: AuctionConfig

class AuctionOut(AuctionCreate):
    id: int
    host_id: int
    status: enums.AuctionStatus

    class Config:
        from_attributes = True
        
class AuctionItemCreate(BaseModel):
    name: str
    description: str
    base_price: float = Field(..., gt=0) # Must be greater than 0
    images: List[str] = [] # List of image URLs

class AuctionItemOut(AuctionItemCreate):
    id: int
    auction_id: int

    class Config:
        from_attributes = True

# ==================================
