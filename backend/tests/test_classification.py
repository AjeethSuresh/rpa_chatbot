"""
Unit and integration tests for AutoFlow AI classification and workflow orchestration.
"""
import pytest
from app.services.llm_service import LLMService
from app.services.rag_service import RAGService


@pytest.mark.asyncio
async def test_email_classification_fallback():
    service = LLMService()
    result = await service.execute_prompt(
        system_prompt="Classify this email.",
        user_prompt="Hello, what is the work from home policy?",
        json_mode=True,
    )
    assert "parsed" in result
    parsed = result["parsed"]
    assert parsed["category"] == "HR_POLICY"
    assert parsed["requires_rag"] is True


@pytest.mark.asyncio
async def test_rag_knowledge_base_retrieval():
    rag = RAGService()
    res = await rag.query_knowledge_base("How many days can I work from home?", top_k=2)
    assert res["confidence"] == "SUPPORTED"
    assert len(res["sources"]) > 0
    assert "HR_Policy" in res["sources"][0]["document"]
