"""
Pinecone Vector Database Service.
Handles index management, upserting chunk embeddings, and querying nearest neighbors.
"""
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.core.logging import logger

try:
    from pinecone import Pinecone, ServerlessSpec
except ImportError:
    Pinecone = None


class PineconeService:
    def __init__(self):
        self.api_key = settings.PINECONE_API_KEY
        self.environment = settings.PINECONE_ENVIRONMENT
        self.index_name = settings.PINECONE_INDEX_NAME
        self.client = None
        self.index = None
        if self.api_key and Pinecone:
            try:
                self.client = Pinecone(api_key=self.api_key)
                # Check index or initialize
                self.index = self.client.Index(self.index_name)
            except Exception as e:
                logger.warning(f"Pinecone init notice: {e}")

    def is_configured(self) -> bool:
        return bool(self.client and self.index)

    async def upsert_vectors(self, vectors: List[Dict[str, Any]], namespace: str = "default") -> int:
        if not self.is_configured():
            logger.info(f"Pinecone not configured; mock-upserting {len(vectors)} vectors in memory")
            return len(vectors)
        try:
            formatted = []
            for v in vectors:
                formatted.append({
                    "id": v["id"],
                    "values": v["values"],
                    "metadata": v.get("metadata", {}),
                })
            self.index.upsert(vectors=formatted, namespace=namespace)
            return len(formatted)
        except Exception as e:
            logger.error(f"Pinecone upsert error: {e}")
            raise e

    async def query_vectors(
        self,
        vector: List[float],
        top_k: int = 4,
        score_threshold: float = 0.70,
        namespace: str = "default",
    ) -> List[Dict[str, Any]]:
        if not self.is_configured():
            logger.info("Pinecone not configured; returning empty vector matches")
            return []
        try:
            results = self.index.query(
                vector=vector,
                top_k=top_k,
                include_metadata=True,
                namespace=namespace,
            )
            matches = []
            for match in results.get("matches", []):
                if match["score"] >= score_threshold:
                    matches.append({
                        "id": match["id"],
                        "score": match["score"],
                        "metadata": match.get("metadata", {}),
                    })
            return matches
        except Exception as e:
            logger.error(f"Pinecone query error: {e}")
            raise e
