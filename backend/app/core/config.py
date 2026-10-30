"""
Application configuration using Pydantic Settings.
Environment variables take precedence over defaults.
"""
from typing import List, Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "AutoFlow AI"
    APP_ENV: str = "development"
    PORT: int = 8000
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "autoflow-insecure-secret-key-change-in-prod"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://localhost:3000",
    ]

    # Database
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "autoflow_ai"

    # LLM Settings
    PRIMARY_LLM_PROVIDER: str = "groq"
    SECONDARY_LLM_PROVIDER: str = "gemini"
    LLM_MAX_RETRIES: int = 2

    # Groq
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama3-70b-8192"
    GROQ_TEMPERATURE: float = 0.1
    GROQ_MAX_TOKENS: int = 2048

    # Gemini
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GEMINI_EMBEDDING_MODEL: str = "text-embedding-004"

    # Pinecone Vector DB
    PINECONE_API_KEY: Optional[str] = None
    PINECONE_ENVIRONMENT: str = "us-east-1"
    PINECONE_INDEX_NAME: str = "autoflow-knowledge-base"
    PINECONE_DIMENSION: int = 768
    RAG_TOP_K: int = 4
    RAG_SCORE_THRESHOLD: float = 0.70

    # UiPath RPA
    UIPATH_ENABLED: bool = True
    UIPATH_ORCHESTRATOR_URL: Optional[str] = None
    UIPATH_CLIENT_ID: Optional[str] = None
    UIPATH_USER_KEY: Optional[str] = None
    UIPATH_TENANT_NAME: str = "Default"
    UIPATH_FOLDER_ID: Optional[int] = None
    UIPATH_WEBHOOK_SECRET: str = "autoflow_secret_webhook_token"
    UIPATH_LOCAL_MODE: bool = True

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"


settings = Settings()
