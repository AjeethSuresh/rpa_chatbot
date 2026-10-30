"""
Pydantic schemas for AI and LLM outputs.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class AIClassifyRequest(BaseModel):
    text: str = Field(..., description="Email or document content to classify")
    subject: Optional[str] = ""
    context: Optional[Dict[str, Any]] = None


class AIExtractRequest(BaseModel):
    text: str
    target_fields: List[str] = ["invoice_number", "vendor", "amount", "due_date", "employee_id"]


class AIExtractResponse(BaseModel):
    extracted: Dict[str, Any]
    confidence_scores: Dict[str, float]
    missing_fields: List[str]
    is_complete: bool


class AIGenerateResponseRequest(BaseModel):
    request_id: str
    user_query: str
    retrieved_context: List[str]
    tone: Optional[str] = "professional"


class AIGenerationResponse(BaseModel):
    answer: str
    grounded_in_rag: bool
    confidence: str
    requires_human_review: bool
    model_used: str
    latency_ms: int
