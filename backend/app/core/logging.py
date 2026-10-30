"""
Structured logging module for AutoFlow AI.
Ensures API keys, tokens, and confidential data are masked.
"""
import logging
import re
import sys

MASK_PATTERNS = [
    re.compile(r"gsk_[a-zA-Z0-9_-]{20,}"),
    re.compile(r"AIza[0-9A-Za-z-_]{35}"),
    re.compile(r"Bearer\s+[a-zA-Z0-9_\-\.]+"),
    re.compile(r"password=([^&]+)", re.IGNORECASE),
]


class SafeFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        msg = super().format(record)
        for pattern in MASK_PATTERNS:
            msg = pattern.sub("[REDACTED_SECRET]", msg)
        return msg


def setup_logger(name: str = "autoflow") -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(
            SafeFormatter(
                fmt="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S",
            )
        )
        logger.addHandler(handler)
    return logger


logger = setup_logger()
