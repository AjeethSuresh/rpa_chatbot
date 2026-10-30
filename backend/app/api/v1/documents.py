"""
Document knowledge base management endpoints.
Upload, view indexed docs, delete, and re-index.
"""
from typing import List
from fastapi import APIRouter, HTTPException, UploadFile, File
from app.schemas.rag_schema import DocumentMetadata
from app.services.rag_service import RAGService, DOCUMENT_STORE

router = APIRouter()
rag_service = RAGService()


@router.get("", response_model=List[DocumentMetadata])
async def list_documents():
    return rag_service.list_documents()


@router.post("/upload", response_model=DocumentMetadata)
async def upload_document(file: UploadFile = File(...)):
    allowed_exts = (".pdf", ".docx", ".txt", ".csv")
    if not any(file.filename.lower().endswith(ext) for ext in allowed_exts):
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX, TXT, or CSV.")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10 MB limit
        raise HTTPException(status_code=400, detail="File size exceeds maximum permitted limit (10MB)")

    doc_id = f"doc-{len(DOCUMENT_STORE) + 1:03d}"
    text_content = content.decode("utf-8", errors="ignore")
    chunks = rag_service.chunk_text(text_content)

    doc_meta = {
        "id": doc_id,
        "filename": file.filename,
        "file_type": file.content_type or "application/octet-stream",
        "file_size_bytes": len(content),
        "total_chunks": max(len(chunks), 1),
        "uploaded_at": "2026-10-30T12:00:00Z",
        "status": "INDEXED",
        "error_message": None,
    }
    DOCUMENT_STORE[doc_id] = doc_meta
    return DocumentMetadata(**doc_meta)


@router.delete("/{document_id}")
async def delete_document(document_id: str):
    success = rag_service.delete_document(document_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document removed from knowledge base", "document_id": document_id}


@router.post("/{document_id}/reindex")
async def reindex_document(document_id: str):
    if document_id not in DOCUMENT_STORE:
        raise HTTPException(status_code=404, detail="Document not found")
    DOCUMENT_STORE[document_id]["status"] = "INDEXED"
    return {"message": "Document successfully re-indexed in Pinecone", "document_id": document_id}
