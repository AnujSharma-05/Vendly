from fastapi import APIRouter, status, HTTPException, Depends
from .. import schemas
from ..db.mongodb import UserCollection, ClientProfileCollection # Import real collections
from ..core.enums import UserRole, ClientProfileStatus
from passlib.context import CryptContext

from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from ..core.config import settings

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# Setup password hashing context
# Use bcrypt_sha256 to avoid bcrypt's 72-byte limit: long passwords are pre-hashed with SHA-256

# Use pbkdf2_sha256 which is pure-python and avoids C-extension issues.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hashes the password using the configured context."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    #to create new jwt token

    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    return encoded_jwt







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
    # set creation timestamp
    user_to_insert["created_at"] = datetime.now(timezone.utc)

    # Insert the new user document into the 'users' collection
    result = await UserCollection.insert_one(user_to_insert)
    
    # Fetch the newly created user from the database to ensure it was saved correctly
    new_user = await UserCollection.find_one({"_id": result.inserted_id})

    # If the user registered as a Client, create their pending profile
    if user_data.role == UserRole.CLIENT:
        client_profile_data = {
            "user_id": str(result.inserted_id),
            "company_name": None,
            "status": ClientProfileStatus.PENDING_APPROVAL
        }
        await ClientProfileCollection.insert_one(client_profile_data)

    # Convert the MongoDB document to a Pydantic model for the response
    # NEW, MORE ROBUST MAPPING
    response_user = {
        "id": str(new_user["_id"]),
        "username": new_user["username"],
        "email": new_user["email"],
        "role": new_user["role"],
        "created_at": new_user["created_at"],
        "is_active": new_user["is_active"]
    }
    return schemas.UserOut(**response_user)



@router.post("/login", response_model=schemas.Token)
async def login(form_data:
OAuth2PasswordRequestForm = Depends()):
    
    """
    Logs in a user by verifying their credentials (username or email)
    and returning a JWT.
    """
    # Step 1: Find the user in the database by EITHER their email OR their username.
    # The '$or' operator in MongoDB is perfect for this.

    user = await UserCollection.find_one({

        "$or": [
            {"email": form_data.username},
            {"username": form_data.username}
        ]
    })

    # 2. Check if the user exists and if the password is correct

    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. If user is valid this will be the access token for them
    access_token = create_access_token(data ={ "sub": user["email"]} #"sub is the standard JWT claim for "subject"
    )

    # 4. Manually construct the response dictionary
    token_response = {
        "access_token": access_token,
        "token_type": "bearer"
    }

    return schemas.Token(**token_response)