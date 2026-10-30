"""
Pydantic schemas for Human-in-the-Loop approvals.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ApprovalItemResponse(BaseModel):
    id: str
    request_id: str
    category: str
    title: str
    summary: str
    original_text: str
    extracted_data: Dict[str, Any]
    ai_recommendation: str
    supporting_sources: List[Dict[str, Any]]
    status: str  # PENDING, APPROVED, REJECTED
    requested_at: str
    decided_at: Optional[str] = None
    decided_by: Optional[str] = None
    decision_reason: Optional[str] = None
    rpa_job_id: Optional[str] = None


class ApprovalDecisionRequest(BaseModel):
    reason: str = Field(..., min_length=3, example="Verified against approved purchase order PO-8891")
    comments: Optional[str] = ""
