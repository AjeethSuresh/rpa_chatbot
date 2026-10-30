"""
Human-in-the-Loop Approval Endpoints.
Prevents unapproved execution of sensitive tasks (high-value invoices, sensitive disbursements).
"""
import uuid
from typing import List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.approval_schema import ApprovalItemResponse, ApprovalDecisionRequest
from app.core.security import RoleChecker
from app.integrations.uipath.client import UiPathClient

router = APIRouter()
uipath_client = UiPathClient()

APPROVALS_DB: List[Dict[str, Any]] = [
    {
        "id": "APP-2026-001",
        "request_id": "REQ-1002",
        "category": "INVOICE_PROCESSING",
        "title": "Vendor Invoice Payment: CloudTech Solutions",
        "summary": "Vendor invoice submitted for $8,450.00 exceeding standard auto-disbursement threshold ($5,000.00).",
        "original_text": "Vendor Invoice #INV-2026-9042 from CloudTech Solutions for $8,450.00 covering October compute and storage cluster nodes. Payment terms: Net 30.",
        "extracted_data": {
            "invoice_number": "INV-2026-9042",
            "vendor_name": "CloudTech Solutions",
            "total_amount": 8450.00,
            "currency": "USD",
            "invoice_date": "2026-10-28",
            "due_date": "2026-11-27",
            "tax_id": "US-88412903",
        },
        "ai_recommendation": "Recommendation: APPROVE. Invoice matches Purchase Order #PO-9912. No vendor discrepancies detected. Dual-authorization required due to >$5K limit.",
        "supporting_sources": [
            {
                "document": "Employee_Travel_and_Reimbursement_Policy.pdf",
                "page": 3,
                "rule": "Claims exceeding $500 require dual approval from the Finance Director before robotic bank disbursement.",
            }
        ],
        "status": "PENDING",
        "requested_at": "2026-10-30T11:00:15Z",
        "decided_at": None,
        "decided_by": None,
        "decision_reason": None,
        "rpa_job_id": None,
    },
    {
        "id": "APP-2026-002",
        "request_id": "REQ-0988",
        "category": "REIMBURSEMENT",
        "title": "Executive Travel Expense Claim ($1,240.00)",
        "summary": "Hotel and international conference pass for AWS Summit in Chicago.",
        "original_text": "Reimbursement claim for conference hotel accommodation and registration fee totaling $1,240.00.",
        "extracted_data": {
            "claimant": "Robert Langdon",
            "expense_type": "Lodging & Conference",
            "total_amount": 1240.00,
            "receipt_attached": True,
        },
        "ai_recommendation": "Recommendation: APPROVE. Receipts valid, within per-diem policy parameters.",
        "supporting_sources": [
            {
                "document": "Employee_Travel_and_Reimbursement_Policy.pdf",
                "page": 2,
                "rule": "Lodging reimbursed up to $300/night with itemized VAT receipts.",
            }
        ],
        "status": "APPROVED",
        "requested_at": "2026-10-29T16:20:00Z",
        "decided_at": "2026-10-29T16:45:10Z",
        "decided_by": "Alex Vance (Reviewer)",
        "decision_reason": "Receipts verified and matched against travel budget allocation.",
        "rpa_job_id": "UIPATH-JOB-7719A",
    },
]


@router.get("/pending", response_model=List[ApprovalItemResponse])
async def list_pending_approvals():
    return [a for a in APPROVALS_DB if a["status"] == "PENDING"]


@router.get("", response_model=List[ApprovalItemResponse])
async def list_all_approvals():
    return APPROVALS_DB


@router.post("/{approval_id}/approve")
async def approve_request(
    approval_id: str,
    body: ApprovalDecisionRequest,
    current_user=Depends(RoleChecker(allowed_roles=["ADMIN", "REVIEWER"])),
):
    approval = None
    for a in APPROVALS_DB:
        if a["id"] == approval_id:
            approval = a
            break
    if not approval:
        raise HTTPException(status_code=404, detail="Approval record not found")
    if approval["status"] != "PENDING":
        raise HTTPException(status_code=400, detail=f"Request is already in '{approval['status']}' state")

    approver_name = current_user.get("sub", "Alex Vance (Reviewer)")
    approval["status"] = "APPROVED"
    approval["decided_at"] = datetime.utcnow().isoformat() + "Z"
    approval["decided_by"] = approver_name
    approval["decision_reason"] = body.reason

    # Trigger UiPath RPA Workflow C (Invoice Processing) automatically upon approval
    token = f"APPROVAL-TOKEN-{uuid.uuid4().hex[:8].upper()}"
    job_result = await uipath_client.trigger_robot_job(
        workflow_name="Workflow_C_InvoiceProcessing",
        request_id=approval["request_id"],
        input_arguments={
            "invoice_number": approval["extracted_data"].get("invoice_number", "INV-2026-9042"),
            "vendor_name": approval["extracted_data"].get("vendor_name", "CloudTech Solutions"),
            "total_amount": approval["extracted_data"].get("total_amount", 8450.00),
            "approval_token": token,
            "approved_by": approver_name,
        },
    )
    approval["rpa_job_id"] = job_result["job_id"]

    return {
        "message": "Request successfully approved and RPA workflow triggered",
        "approval_id": approval_id,
        "rpa_job_id": job_result["job_id"],
        "execution_status": job_result["status"],
    }


@router.post("/{approval_id}/reject")
async def reject_request(
    approval_id: str,
    body: ApprovalDecisionRequest,
    current_user=Depends(RoleChecker(allowed_roles=["ADMIN", "REVIEWER"])),
):
    approval = None
    for a in APPROVALS_DB:
        if a["id"] == approval_id:
            approval = a
            break
    if not approval:
        raise HTTPException(status_code=404, detail="Approval record not found")
    if approval["status"] != "PENDING":
        raise HTTPException(status_code=400, detail=f"Request is already in '{approval['status']}' state")

    approval["status"] = "REJECTED"
    approval["decided_at"] = datetime.utcnow().isoformat() + "Z"
    approval["decided_by"] = current_user.get("sub", "Alex Vance (Reviewer)")
    approval["decision_reason"] = body.reason

    return {"message": "Request rejected. RPA execution cancelled.", "approval_id": approval_id}
