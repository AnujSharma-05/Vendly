from fastapi import APIRouter, status, HTTPException
from .. import schemas
from ..db.mongodb import UserCollection, ClientProfileCollection # Import real collections
from ..core.enums import UserRole, ClientProfileStatus
from passlib.context import CryptContext

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# Setup password hashing context
# Use bcrypt_sha256 to avoid bcrypt's 72-byte limit: long passwords are pre-hashed with SHA-256
"""
Use a non-bcrypt backend to avoid platform-specific bcrypt issues and the 72-byte limit.
`pbkdf2_sha256` is widely supported and implemented in passlib without requiring the `bcrypt` C-extension.
If you prefer Argon2, install `argon2-cffi` and switch to the `argon2` scheme.
"""
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=schemas.UserOut)
async def register_user(user_data: schemas.UserCreate):
    # Check if a user with that email already exists in the database
    existing_user = await UserCollection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    # Hash the user's password for secure storage
    hashed_password = get_password_hash(user_data.password)
    
    # Prepare the user document for insertion
    user_to_insert = user_data.model_dump(exclude={"password"})
    user_to_insert["hashed_password"] = hashed_password
    user_to_insert["is_active"] = True

    # Insert the new user document into the 'users' collection
    result = await UserCollection.insert_one(user_to_insert)
    
    # Fetch the newly created user from the database to ensure it was saved correctly
    new_user = await UserCollection.find_one({"_id": result.inserted_id})

    # If the user registered as a Client, create their pending profile
    if user_data.role == UserRole.CLIENT:
        client_profile_data = {
            "user_id": result.inserted_id,
            "company_name": None,
            "status": ClientProfileStatus.PENDING_APPROVAL
        }
        await ClientProfileCollection.insert_one(client_profile_data)

    # Convert the MongoDB document to a Pydantic model for the response
    # The `id` field in Pydantic needs to be mapped from MongoDB's `_id`
    # We will refine this mapping later with a base model, but this works for now.
    new_user["id"] = str(new_user["_id"])
    return new_user