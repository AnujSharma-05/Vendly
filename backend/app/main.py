from fastapi import FastAPI

app = FastAPI(
title = "VendlyAPI",
description = "The backend for the Vendly real time auction platform",
version="0.1.0"
)


@app.get("/")
async def read_root():
    """
    Simple root endpoint to check if api is running or not
    """
    return{
        "message" "Welcome to Vendly API!"
    }

