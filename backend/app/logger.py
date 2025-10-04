import logging
import sys
import uuid
from contextvars import ContextVar
from logging.handlers import RotatingFileHandler

# ContextVar to store per-request IDs
request_id_ctx = ContextVar("request_id", default="-")

def generate_request_id() -> str:
    """Generate a unique request ID (UUID4)."""
    return str(uuid.uuid4())

class RequestIdFilter(logging.Filter):
    def filter(self, record):
        record.request_id = request_id_ctx.get()
        return True

def setup_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    if not logger.handlers:
        # Console handler
        stream_handler = logging.StreamHandler(sys.stdout)
        stream_formatter = logging.Formatter(
            "%(asctime)s | %(levelname)s | %(request_id)s | %(name)s | %(message)s"
        )
        stream_handler.setFormatter(stream_formatter)
        stream_handler.addFilter(RequestIdFilter())
        logger.addHandler(stream_handler)

        # File handler with rotation
        file_handler = RotatingFileHandler(
            "logs/app.log", maxBytes=5*1024*1024, backupCount=5  # 5MB per file, keep 5 backups
        )
        file_formatter = logging.Formatter(
            "%(asctime)s | %(levelname)s | %(request_id)s | %(name)s | %(message)s"
        )
        file_handler.setFormatter(file_formatter)
        file_handler.addFilter(RequestIdFilter())
        logger.addHandler(file_handler)

    return logger

# Global logger
app_logger = setup_logger("ai_trip_planner")
