"""
Groq LLM Service implementation.
Supports currently active high-speed models on Groq (Llama 3 / Mixtral).
"""
import time
from typing import Dict, Any, Optional
from app.core.config import settings
from app.core.logging import logger

try:
    from groq import Groq
except ImportError:
    Groq = None


class GroqService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self.temperature = settings.GROQ_TEMPERATURE
        self.max_tokens = settings.GROQ_MAX_TOKENS
        self.client = None
        if self.api_key and Groq:
            try:
                self.client = Groq(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Groq client init error: {e}")

    def is_configured(self) -> bool:
        return bool(self.client and self.api_key)

    async def generate(self, system_prompt: str, user_prompt: str, json_mode: bool = True) -> Dict[str, Any]:
        if not self.is_configured():
            raise RuntimeError("Groq API key not configured or client missing")

        start_time = time.time()
        try:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ]
            response_format = {"type": "json_object"} if json_mode else None

            chat_completion = self.client.chat.completions.create(
                messages=messages,
                model=self.model,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                response_format=response_format,
            )
            duration_ms = int((time.time() - start_time) * 1000)
            content = chat_completion.choices[0].message.content

            return {
                "content": content,
                "provider": "groq",
                "model": self.model,
                "latency_ms": duration_ms,
                "tokens_prompt": chat_completion.usage.prompt_tokens if chat_completion.usage else 0,
                "tokens_completion": chat_completion.usage.completion_tokens if chat_completion.usage else 0,
            }
        except Exception as e:
            logger.error(f"Groq API call error: {str(e)}")
            raise e
