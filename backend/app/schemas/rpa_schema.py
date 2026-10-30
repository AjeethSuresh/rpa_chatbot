"""
Pydantic schemas for RPA execution and UiPath integrations.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class RPAExecuteRequest(BaseModel):
    workflow_name: str = Field(..., example="Workflow_B_SupportTicket")
    request_id: str
    input_arguments: Dict[str, Any]
    approval_token: Optional[str] = None


class RPAJobResponse(BaseModel):
    job_id: str
    request_id: str
    workflow_name: str
    status: str  # RPA_PENDING, RPA_RUNNING, RPA_COMPLETED, RPA_FAILED, AWAITING_APPROVAL
    start_time: str
    end_time: Optional[str] = None
    execution_result: Optional[Dict[str, Any]] = None
    error_details: Optional[str] = None
    logs: List[str] = []


class RPACallbackPayload(BaseModel):
    job_id: str
    status: str  # SUCCESS, FAILED
    output_arguments: Dict[str, Any] = {}
    error_message: Optional[str] = None
    execution_duration_sec: Optional[float] = None
