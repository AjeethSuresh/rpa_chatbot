"""
RAG query and semantic search endpoints.
"""
from fastapi import APIRouter
from app.schemas.rag_schema import RAGQueryRequest, RAGQueryResponse
from app.services.rag_service import RAGService

router = APIRouter()
rag_service = RAGService()


@router.post("/query", response_model=RAGQueryResponse)
async def query_knowledge_base(req: RAGQueryRequest):
    result = await rag_service.query_knowledge_base(
        query=req.query,
        top_k=req.top_k or 4,
        score_threshold=req.score_threshold or 0.60,
    )
    return RAGQueryResponse(**result)
