"""
Custom domain exceptions for AutoFlow AI.
"""
from fastapi import HTTPException, status


class LLMServiceException(HTTPException):
    def __init__(self, detail: str = "LLM provider call failed"):
        super().__init__(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail)


class RAGRetrievalException(HTTPException):
    def __init__(self, detail: str = "RAG retrieval or vector search failure"):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)


class RPAExecutionException(HTTPException):
    def __init__(self, detail: str = "RPA workflow execution error"):
        super().__init__(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail)


class InvalidTransitionException(HTTPException):
    def __init__(self, detail: str = "Illegal workflow state transition"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class ApprovalRequiredException(HTTPException):
    def __init__(self, detail: str = "Action requires authorized human approval before execution"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)
