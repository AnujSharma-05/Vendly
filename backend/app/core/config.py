from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    MONGO_DETAILS: str
    
    # This tells pydantic to load the variables from the .env file
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_HOURS: int

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()