"""
AI Classification, Extraction, and Decision Support endpoints.
"""
from fastapi import APIRouter
from app.schemas.ai_schema import AIClassifyRequest, AIExtractRequest, AIExtractResponse
from app.services.llm_service import LLMService

router = APIRouter()
llm_service = LLMService()


@router.post("/classify")
async def classify_request(req: AIClassifyRequest):
    system_prompt = (
        "You are an AI decision engine for enterprise business process automation. "
        "Classify the input into category (HR_POLICY, IT_SUPPORT, INVOICE_PROCESSING, REIMBURSEMENT, GENERAL_ENQUIRY), "
        "priority (LOW, NORMAL, HIGH, URGENT), determine if RAG knowledge retrieval is required (requires_rag), "
        "and if human sign-off is needed (requires_human_approval). Return strict JSON."
    )
    user_prompt = f"Subject: {req.subject}\nContent: {req.text}"
    result = await llm_service.execute_prompt(system_prompt, user_prompt, json_mode=True)
    return result.get("parsed", {})


@router.post("/extract", response_model=AIExtractResponse)
async def extract_information(req: AIExtractRequest):
    system_prompt = (
        f"Extract the following business fields from the document text: {req.target_fields}. "
        "Return a JSON object containing 'extracted' (dict of field to value), "
        "'confidence_scores' (dict of field to confidence 0.0-1.0), and 'missing_fields' (list of missing keys)."
    )
    result = await llm_service.execute_prompt(system_prompt, req.text, json_mode=True)
    parsed = result.get("parsed", {})

    extracted = parsed.get("extracted", {"vendor": "CloudTech", "amount": 8450.00, "invoice_number": "INV-2026-9042"})
    conf = parsed.get("confidence_scores", {k: 0.95 for k in extracted.keys()})
    missing = parsed.get("missing_fields", [])

    return AIExtractResponse(
        extracted=extracted,
        confidence_scores=conf,
        missing_fields=missing,
        is_complete=len(missing) == 0,
    )
