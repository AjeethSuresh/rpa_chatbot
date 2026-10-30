"""
UiPath Webhook Handler.
Receives callback events from UiPath Orchestrator or robots when long-running jobs finish.
"""
import hmac
import hashlib
from typing import Dict, Any
from fastapi import HTTPException, status
from app.core.config import settings
from app.core.logging import logger


def verify_webhook_signature(signature: str, payload_bytes: bytes) -> bool:
    if not settings.UIPATH_WEBHOOK_SECRET:
        return True
    computed = hmac.new(
        settings.UIPATH_WEBHOOK_SECRET.encode(),
        payload_bytes,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, computed)


async def process_uipath_callback(payload: Dict[str, Any]) -> Dict[str, Any]:
    job_id = payload.get("job_id")
    event_status = payload.get("status", "SUCCESS")
    logger.info(f"Received UiPath Webhook Callback for Job {job_id} [Status: {event_status}]")

    return {
        "status": "PROCESSED",
        "job_id": job_id,
        "recorded_at": payload.get("timestamp"),
    }
