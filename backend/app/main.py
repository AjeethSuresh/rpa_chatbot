"""
AutoFlow AI — FastAPI Application Entry Point.
Provides REST APIs for LLM decision making, RAG document retrieval,
Human Approval routing, and UiPath RPA job dispatching.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import (
    auth,
    emails,
    documents,
    ai,
    rag,
    rpa,
    approvals,
    analytics,
    health,
)

app = FastAPI(
    title="AutoFlow AI API",
    description="Intelligent Business Process Automation Platform combining LLM, RAG & UiPath RPA",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 Routers
app.include_router(health.router, prefix=f"{settings.API_V1_STR}/health", tags=["Health"])
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(emails.router, prefix=f"{settings.API_V1_STR}/emails", tags=["Email Processing"])
app.include_router(documents.router, prefix=f"{settings.API_V1_STR}/documents", tags=["Knowledge Base & RAG"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["AI Processing Center"])
app.include_router(rag.router, prefix=f"{settings.API_V1_STR}/rag", tags=["RAG Retrieval"])
app.include_router(rpa.router, prefix=f"{settings.API_V1_STR}/rpa", tags=["UiPath RPA Automation"])
app.include_router(approvals.router, prefix=f"{settings.API_V1_STR}/approvals", tags=["Human Approvals"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["Analytics & Metrics"])


@app.get("/")
async def root():
    return {
        "app": "AutoFlow AI",
        "status": "ONLINE",
        "documentation": "/docs",
        "api_v1": settings.API_V1_STR,
    }
