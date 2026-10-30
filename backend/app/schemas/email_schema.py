"""
Pydantic schemas for Email processing and structured requests.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class EmailUploadRequest(BaseModel):
    sender: str = Field(..., example="jane.doe@acme-corp.com")
    subject: str = Field(..., example="Inquiry on Work From Home Policy")
    body: str = Field(..., example="Hello, how many days are allowed per week for remote work?")
    timestamp: Optional[datetime] = None
    attachments: Optional[List[str]] = []


class EmailResponse(BaseModel):
    id: str
    sender: str
    subject: str
    body: str
    received_at: str
    attachments: List[str]
    status: str
    category: Optional[str] = None
    priority: Optional[str] = None
    request_id: Optional[str] = None


class EmailClassificationResult(BaseModel):
    request_id: str
    category: str
    subcategory: str
    priority: str
    requires_rag: bool
    requires_human_approval: bool
    confidence: float
    summary: str
    extracted_fields: Dict[str, Any]
    missing_fields: List[str]
    suggested_action: str
    status: str
