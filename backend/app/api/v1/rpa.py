"""
UiPath RPA execution and job management endpoints.
Exposes endpoints consumed by the frontend and UiPath Orchestrator / Robots.
"""
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.schemas.rpa_schema import RPAExecuteRequest, RPAJobResponse, RPACallbackPayload
from app.integrations.uipath.client import UiPathClient
from app.integrations.uipath.webhook import process_uipath_callback

router = APIRouter()
uipath_client = UiPathClient()

# In-memory registry of executed RPA jobs
RPA_JOBS_DB: List[Dict[str, Any]] = [
    {
        "job_id": "UIPATH-JOB-A19F8021",
        "request_id": "REQ-1003",
        "workflow_name": "Workflow_B_SupportTicket",
        "status": "RPA_COMPLETED",
        "start_time": "2026-10-30T11:46:10Z",
        "end_time": "2026-10-30T11:46:25Z",
        "execution_result": {
            "ticket_reference": "INC-2026-8819",
            "portal_url": "https://itsm-demo.internal/tickets/INC-2026-8819",
            "assigned_agent": "AutoFlow Virtual Worker #2",
        },
        "error_details": None,
        "logs": [
            "[2026-10-30T11:46:10Z] Initializing UiPath Studio Robot Agent v2024.10",
            "[2026-10-30T11:46:12Z] Loading workflow package: Workflow_B_SupportTicket.nupkg",
            "[2026-10-30T11:46:15Z] Opening Demo Support Ticket Management Portal",
            "[2026-10-30T11:46:18Z] Populating incident details: Category IT_SUPPORT, Priority URGENT",
            "[2026-10-30T11:46:21Z] Clicking Submit and capturing generated incident token",
            "[2026-10-30T11:46:25Z] UiPath Robot execution finished with exit code 0 (SUCCESS)",
        ],
    },
    {
        "job_id": "UIPATH-JOB-B42C1099",
        "request_id": "REQ-1001",
        "workflow_name": "Workflow_A_EmailProcessing",
        "status": "RPA_COMPLETED",
        "start_time": "2026-10-30T10:16:00Z",
        "end_time": "2026-10-30T10:16:14Z",
        "execution_result": {
            "draft_id": "DRAFT-7741",
            "status": "DRAFT_CREATED",
            "recipient": "jennifer.lawrence@acme.org",
        },
        "error_details": None,
        "logs": [
            "[2026-10-30T10:16:00Z] Robot session spawned for Workflow_A_EmailProcessing",
            "[2026-10-30T10:16:05Z] Reading grounded RAG policy answer from FastAPI backend",
            "[2026-10-30T10:16:09Z] Formatting professional email response draft",
            "[2026-10-30T10:16:14Z] Email draft queued for delivery; exit code 0",
        ],
    },
]


@router.get("/jobs", response_model=List[RPAJobResponse])
async def list_rpa_jobs():
    return RPA_JOBS_DB


@router.get("/jobs/{job_id}", response_model=RPAJobResponse)
async def get_rpa_job(job_id: str):
    for j in RPA_JOBS_DB:
        if j["job_id"] == job_id:
            return j
    raise HTTPException(status_code=404, detail="RPA Job not found")


@router.post("/execute", response_model=RPAJobResponse)
async def execute_rpa_job(req: RPAExecuteRequest):
    # Verify if workflow requires prior approval
    if req.workflow_name == "Workflow_C_InvoiceProcessing" and not req.approval_token:
        raise HTTPException(
            status_code=403,
            detail="Workflow C (Invoice Processing) strictly requires prior human approval token.",
        )

    job_result = await uipath_client.trigger_robot_job(
        workflow_name=req.workflow_name,
        request_id=req.request_id,
        input_arguments=req.input_arguments,
    )
    RPA_JOBS_DB.insert(0, job_result)
    return RPAJobResponse(**job_result)


@router.post("/callback")
async def rpa_callback(payload: RPACallbackPayload):
    """Webhook callback endpoint hit by UiPath Orchestrator or Robot upon completion."""
    for j in RPA_JOBS_DB:
        if j["job_id"] == payload.job_id:
            j["status"] = "RPA_COMPLETED" if payload.status == "SUCCESS" else "RPA_FAILED"
            if payload.output_arguments:
                j["execution_result"] = payload.output_arguments
            if payload.error_message:
                j["error_details"] = payload.error_message
            return {"status": "UPDATED", "job_id": payload.job_id}

    return {"status": "UNKNOWN_JOB", "job_id": payload.job_id}
