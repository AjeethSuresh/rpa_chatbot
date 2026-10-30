"""
Email ingestion and processing endpoints.
Supports manual upload, .eml file parsing, and triggering AI classification workflows.
"""
import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.schemas.email_schema import EmailUploadRequest, EmailResponse, EmailClassificationResult
from app.services.llm_service import LLMService

router = APIRouter()
llm_service = LLMService()

# In-memory storage for incoming emails
EMAILS_DB = [
    {
        "id": "EML-101",
        "sender": "jennifer.lawrence@acme.org",
        "subject": "Question regarding Work From Home Policy",
        "body": "Hello HR Team,\n\nI wanted to ask about our remote working guidelines. How many days per week are permitted for remote work under the 2026 handbook?\n\nThanks,\nJennifer",
        "received_at": "2026-10-30T10:15:00Z",
        "attachments": [],
        "status": "PROCESSED",
        "category": "HR_POLICY",
        "priority": "NORMAL",
        "request_id": "REQ-1001",
    },
    {
        "id": "EML-102",
        "sender": "accounting@cloudtech-solutions.io",
        "subject": "Vendor Invoice #INV-2026-9042 - Cloud Infrastructure",
        "body": "Dear Finance Operations,\n\nPlease find attached Invoice #INV-2026-9042 from CloudTech Solutions for $8,450.00 covering October compute and storage cluster nodes. Payment terms: Net 30.\n\nRegards,\nBilling Department",
        "received_at": "2026-10-30T11:00:00Z",
        "attachments": ["Invoice_INV_2026_9042.pdf"],
        "status": "AWAITING_APPROVAL",
        "category": "INVOICE_PROCESSING",
        "priority": "HIGH",
        "request_id": "REQ-1002",
    },
    {
        "id": "EML-103",
        "sender": "marcus.brody@acme.org",
        "subject": "Urgent: VPN Gateway Unresponsive after update",
        "body": "Hi Support,\n\nI cannot connect to the corporate VPN gateway after this morning's patch. Multiple team members in Marketing are locked out. Please resolve ASAP.\n\nMarcus Brody",
        "received_at": "2026-10-30T11:45:00Z",
        "attachments": [],
        "status": "RPA_COMPLETED",
        "category": "IT_SUPPORT",
        "priority": "URGENT",
        "request_id": "REQ-1003",
    },
]


@router.get("", response_model=List[EmailResponse])
async def list_emails():
    return EMAILS_DB


@router.get("/{email_id}", response_model=EmailResponse)
async def get_email(email_id: str):
    for eml in EMAILS_DB:
        if eml["id"] == email_id:
            return eml
    raise HTTPException(status_code=404, detail="Email not found")


@router.post("/upload", response_model=EmailResponse)
async def upload_email(req: EmailUploadRequest):
    new_id = f"EML-{len(EMAILS_DB) + 101}"
    record = {
        "id": new_id,
        "sender": req.sender,
        "subject": req.subject,
        "body": req.body,
        "received_at": datetime.utcnow().isoformat() + "Z",
        "attachments": req.attachments or [],
        "status": "RECEIVED",
        "category": None,
        "priority": None,
        "request_id": None,
    }
    EMAILS_DB.insert(0, record)
    return record


@router.post("/upload-eml")
async def upload_eml_file(file: UploadFile = File(...)):
    """Parse raw .eml file content."""
    content = await file.read()
    text = content.decode("utf-8", errors="ignore")

    # Simple RFC 822 extraction
    sender = "unknown@sender.com"
    subject = file.filename
    for line in text.splitlines():
        if line.lower().startswith("from:"):
            sender = line[5:].strip()
        elif line.lower().startswith("subject:"):
            subject = line[8:].strip()

    new_id = f"EML-{len(EMAILS_DB) + 101}"
    record = {
        "id": new_id,
        "sender": sender,
        "subject": subject,
        "body": text[:2000],
        "received_at": datetime.utcnow().isoformat() + "Z",
        "attachments": [file.filename],
        "status": "RECEIVED",
        "category": None,
        "priority": None,
        "request_id": None,
    }
    EMAILS_DB.insert(0, record)
    return record


@router.post("/{email_id}/process", response_model=EmailClassificationResult)
async def process_email(email_id: str):
    email = None
    for e in EMAILS_DB:
        if e["id"] == email_id:
            email = e
            break
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    system_prompt = (
        "You are AutoFlow AI's email classification engine. Analyze the email and output a strict JSON object with fields: "
        "category (one of HR_POLICY, IT_SUPPORT, INVOICE_PROCESSING, REIMBURSEMENT, GENERAL_ENQUIRY, OTHER_UNKNOWN), "
        "subcategory, priority (LOW, NORMAL, HIGH, URGENT), requires_rag (boolean), requires_human_approval (boolean), "
        "confidence (float 0.0-1.0), summary (string), extracted_fields (object), missing_fields (list of strings), "
        "suggested_action (string), status (CLASSIFIED)."
    )
    user_prompt = f"Subject: {email['subject']}\nSender: {email['sender']}\nBody:\n{email['body']}"

    result = await llm_service.execute_prompt(system_prompt, user_prompt, json_mode=True)
    parsed = result.get("parsed", {})

    req_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
    email["status"] = "PROCESSED"
    email["category"] = parsed.get("category", "GENERAL_ENQUIRY")
    email["priority"] = parsed.get("priority", "NORMAL")
    email["request_id"] = req_id

    return EmailClassificationResult(
        request_id=req_id,
        category=email["category"],
        subcategory=parsed.get("subcategory", "GENERAL"),
        priority=email["priority"],
        requires_rag=parsed.get("requires_rag", True),
        requires_human_approval=parsed.get("requires_human_approval", False),
        confidence=float(parsed.get("confidence", 0.95)),
        summary=parsed.get("summary", email["subject"]),
        extracted_fields=parsed.get("extracted_fields", {}),
        missing_fields=parsed.get("missing_fields", []),
        suggested_action=parsed.get("suggested_action", "PROCEED_AUTOMATION"),
        status="CLASSIFIED",
    )
