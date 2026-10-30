"""
Google Gemini LLM Service implementation using @google/genai SDK.
Used as secondary fallback and embedding generation provider.
"""
import time
from typing import Dict, Any, Optional
from app.core.config import settings
from app.core.logging import logger

try:
    from google import genai
except ImportError:
    genai = None


class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.GEMINI_MODEL
        self.client = None
        if self.api_key and genai:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Gemini client init error: {e}")

    def is_configured(self) -> bool:
        return bool(self.client and self.api_key)

    async def generate(self, system_prompt: str, user_prompt: str, json_mode: bool = True) -> Dict[str, Any]:
        if not self.is_configured():
            raise RuntimeError("Gemini API key not configured or client missing")

        start_time = time.time()
        try:
            full_prompt = f"System: {system_prompt}\n\nUser: {user_prompt}"
            config = {}
            if json_mode:
                config["response_mime_type"] = "application/json"

            response = self.client.models.generate_content(
                model=self.model,
                contents=full_prompt,
                config=config,
            )
            duration_ms = int((time.time() - start_time) * 1000)

            return {
                "content": response.text,
                "provider": "gemini",
                "model": self.model,
                "latency_ms": duration_ms,
                "tokens_prompt": 0,
                "tokens_completion": 0,
            }
        except Exception as e:
            logger.error(f"Gemini API call error: {str(e)}")
            raise e
