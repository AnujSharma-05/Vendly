from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    CLIENT = "client"
    PARTICIPANT = "participant" 

class ClientProfileStatus(str, Enum):
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    SUSPENDED = "suspended"

class AuctionStatus(str, Enum):
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    FINISHED = "finished"
    CANCELLED = "cancelled"

class AuctionEntryMode(str, Enum):
    PUBLIC = "public"
    INVITE_ONLY = "invite_only"

class AuctionRosterRole(str, Enum):
    PARTICIPANT = "participant"
    SPECTATOR = "spectator"

class TransactionStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"