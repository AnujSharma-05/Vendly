from fastapi import APIRouter, status, HTTPException
from .. import schemas
from datetime import datetime


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# --- Temporary In-Memory Databases ---
# We will replace these with MongoDB collections soon.
fake_user_db = []
fake_client_profile_db = []
# ---

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=schemas.UserOut)
async def register_user(user_data: schemas.UserCreate):
    # Check if user already exists (we'll make this a real DB query later)
    for user in fake_user_db:
        if user["email"] == user_data.email:
            raise HTTPException(status_code=400, detail="Email already registered.")
    
    
    
    # In a real app: HASH THE PASSWORD HERE
    # hashedPassword = hash(user_data.password)

    user_id = len(fake_user_db) + 1
    new_user = {
        "id": user_id,
        "username": user_data.username,
        "email": user_data.email,
        "role": user_data.role,
        "created_at": datetime.utcnow(),
        "is_active": True # Users are active by default
    }
    fake_user_db.append(new_user)

    # ** CRITICAL LOGIC **
    # If the user is registering as a Client, create their pending profile.
    if user_data.role == schemas.enums.UserRole.CLIENT:
        new_profile = {
            "user_id": user_id,
            "company_name": None, # They can fill this out later
            "status": schemas.enums.ClientProfileStatus.PENDING_APPROVAL
        }
        fake_client_profile_db.append(new_profile)
        print(f"Created a pending client profile for user {user_id}")

    return new_user