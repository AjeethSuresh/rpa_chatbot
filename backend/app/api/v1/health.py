"""
Health check and configuration status endpoint.
Never exposes sensitive API keys.
"""
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()


@router.get("")
async def get_system_health():
    return {
        "status": "HEALTHY",
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "integrations": {
            "primary_llm": {
                "provider": settings.PRIMARY_LLM_PROVIDER,
                "configured": bool(settings.GROQ_API_KEY),
                "model": settings.GROQ_MODEL,
            },
            "secondary_llm": {
                "provider": settings.SECONDARY_LLM_PROVIDER,
                "configured": bool(settings.GEMINI_API_KEY),
                "model": settings.GEMINI_MODEL,
            },
            "vector_db": {
                "engine": "Pinecone",
                "configured": bool(settings.PINECONE_API_KEY),
                "index": settings.PINECONE_INDEX_NAME,
            },
            "rpa_engine": {
                "system": "UiPath Studio & Orchestrator",
                "mode": "LOCAL_DEVELOPMENT" if settings.UIPATH_LOCAL_MODE else "ORCHESTRATOR_CLOUD",
                "status": "OPERATIONAL",
            },
        },
    }
