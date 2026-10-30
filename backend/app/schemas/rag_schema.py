"""
Pydantic schemas for RAG operations and document chunks.
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class DocumentMetadata(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size_bytes: int
    total_chunks: int
    uploaded_at: str
    status: str
    error_message: Optional[str] = None


class RAGQueryRequest(BaseModel):
    query: str = Field(..., example="What is the work from home policy?")
    top_k: Optional[int] = 4
    score_threshold: Optional[float] = 0.70


class SourceCitation(BaseModel):
    document: str
    page: Optional[int] = 1
    chunk_id: str
    score: float
    snippet: str


class RAGQueryResponse(BaseModel):
    query: str
    answer: str
    sources: List[SourceCitation]
    confidence: str  # SUPPORTED, PARTIAL, UNSUPPORTED
    requires_human_review: bool
    retrieval_latency_ms: int
    generation_latency_ms: int
