from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, users, admin, client, auction_items, auctions

app = FastAPI(
title = "VendlyAPI",
description = "The backend for the Vendly real time auction platform",
version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173",  # Alternative localhost
        "http://localhost:3000",  # React default (if needed)
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(admin.router)
app.include_router(client.router)
app.include_router(auction_items.router)
app.include_router(auctions.router)

@app.get("/")
async def read_root():
    """
    Simple root endpoint to check if api is running or not
    """
    return{
        "message": "Welcome to Vendly API!"
    }

