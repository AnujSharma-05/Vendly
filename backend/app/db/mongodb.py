import motor.motor_asyncio
from ..core.config import settings

# This creates a single, reusable client instance for the application
client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGO_DETAILS)

# Get a reference to our main database, which we'll call 'vendly'
database = client.vendly

# Get references to each of our collections.
# MongoDB will create these collections automatically on first use.
UserCollection = database.get_collection("users")
ClientProfileCollection = database.get_collection("client_profiles")
AuctionCollection = database.get_collection("auctions")
# ... we will add more as we need them