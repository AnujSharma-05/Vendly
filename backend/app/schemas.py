from pydantic import BaseModel, EmailStr, Field, ConfigDict
from pydantic.functional_validators import BeforeValidator
from bson import ObjectId
from typing import Optional, List, Annotated
from datetime import datetime
from .core import enums

# ====================================================================
#          CORE TYPE DEFINITION FOR MONGODB OBJECTID
# ====================================================================

# This is a custom Pydantic type annotation. It creates a "smart" type.
# GOAL: We want our API to use simple strings for IDs, but the database uses
#       special ObjectId objects. This type handles the conversion automatically.
#
# HOW IT WORKS:
#   - Annotated[str, BeforeValidator(str)]: This tells Pydantic...
#       1. The final, validated type should be a Python `str`.
#       2. Before you attempt any validation, run the input value through
#          the `str()` function.
#   - THE RESULT: When Pydantic receives an ObjectId('...') from the database,
#     it first runs `str(ObjectId('...'))` which converts it to a plain string.
#     This string is then validated, satisfying the type hint.
PyObjectId = Annotated[str, BeforeValidator(str)]


# ====================================================================
#          BASE MODEL FOR ALL MONGODB DOCUMENTS
# ====================================================================

# GOAL: Create a reusable base model that all our database-backed schemas
#       can inherit from. This avoids repeating the same configuration.
class MongoBaseModel(BaseModel):
    # This field will be named `id` in our API responses.
    # It is an alias for the `_id` field from the MongoDB document.
    # The `PyObjectId` type ensures the `_id` is converted to a string.
    id: Optional[PyObjectId] = Field(alias="_id", default=None)

    # Pydantic Model Configuration
    model_config = ConfigDict(
        # When creating a model instance, allow it to be populated by field name OR alias.
        # This is CRITICAL for mapping `_id` from the DB to our `id` field.
        populate_by_name=True,
        # Allows Pydantic to work with non-standard types like ObjectId during model creation,
        # before our custom `PyObjectId` validator converts it.
        arbitrary_types_allowed=True,
    )


# ====================================================================
#                       USER & AUTH SCHEMAS
# ====================================================================

class UserBase(BaseModel):
    """Fields that are common to all User-related schemas."""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr

class UserCreate(UserBase):
    """Schema used ONLY for creating a new user. Includes the password."""
    password: str = Field(..., min_length=8)
    role: enums.UserRole = enums.UserRole.PARTICIPANT  # Sensible default

class UserOut(MongoBaseModel, UserBase):
    """
    Schema for representing a user in API responses. Inherits from our MongoBaseModel
    to get the `id` field and from UserBase for common fields.
    Crucially, it does NOT include the password.
    """
    role: enums.UserRole
    created_at: datetime
    is_active: bool


# ====================================================================
#                       CLIENT PROFILE SCHEMAS
# ====================================================================

class ClientProfileOut(MongoBaseModel):
    """Schema for representing a Client's profile in API responses."""
    user_id: PyObjectId  # The ID of the user this profile belongs to.
    company_name: Optional[str] = None
    status: enums.ClientProfileStatus

class ClientProfileWithUserOut(ClientProfileOut):
    """Schema for Client Profile with User information (for admin views)."""
    username: Optional[str] = None
    email: Optional[str] = None


# ====================================================================
#                  AUCTION & RELATED ITEM SCHEMAS
# ====================================================================

class AuctionConfig(BaseModel):
    """Defines the rules and configuration for a specific auction."""
    max_participants: int
    entry_mode: enums.AuctionEntryMode
    participant_spending_limit: float
    allow_anonymous_spectators: bool = False # Feature discussed and included.

class AuctionCreate(BaseModel):
    """Schema used ONLY for creating a new auction."""
    title: str = Field(..., max_length=100)
    description: str
    start_time: datetime
    end_time: datetime
    config: AuctionConfig

class AuctionOut(MongoBaseModel, AuctionCreate):
    """Schema for representing an auction in API responses."""
    host_id: PyObjectId # The ID of the Client user hosting the auction.
    status: enums.AuctionStatus


class AuctionItemCreate(BaseModel):
    """Schema used ONLY for creating a new auction item."""
    name: str
    description: str
    base_price: float = Field(..., gt=0)  # Price must be greater than zero.
    images: List[str] = []  # A list of image URLs.

class AuctionItemOut(MongoBaseModel, AuctionItemCreate):
    """Schema for representing an auction item in API responses."""
    auction_id: PyObjectId # The ID of the auction this item belongs to.


# ====================================================================
#                           TOKEN SCHEMAS
# ====================================================================

class Token(BaseModel):
    """Schema for the response body of the /login endpoint."""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Schema for the data encoded within a JWT (the token's "payload")."""
    email: Optional[str] = None # We are using the email as the token's subject ("sub").