import logging
import sys
import uuid
import requests
from contextvars import ContextVar
import os 
from dotenv import load_dotenv
load_dotenv()

# ContextVar for request IDs
request_id_ctx = ContextVar("request_id", default="-")

def generate_request_id() -> str:
    return str(uuid.uuid4())

class RequestIdFilter(logging.Filter):
    def filter(self, record):
        record.request_id = request_id_ctx.get()
        return True

class OpenSearchHandler(logging.Handler):
    """Custom log handler that sends logs to OpenSearch ingest pipeline."""

    def __init__(self, url: str, username: str, password: str):
        super().__init__()
        self.url = url
        self.auth = (username, password)

    def emit(self, record):
        log_entry = self.format(record)

        payload = [{
            "team": "abiento",             # 🔹 you can make this dynamic
            "user": os.getenv("opensearch_user"),            # 🔹 static or from your context
            "action": record.levelname,    # INFO, ERROR, DEBUG, etc.
            "message": log_entry
        }]

        try:
            requests.post(
                self.url,
                json=payload,
                headers={"Content-Type": "application/json"},
                auth=self.auth,
                timeout=2
            )
        except Exception as e:
            # fallback: still log locally if OpenSearch fails
            logging.getLogger("fallback").error(f"Failed to send log to OpenSearch: {e}")

def setup_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    if not logger.handlers:
        # Console handler
        stream_handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            "%(asctime)s | %(levelname)s | %(request_id)s | %(name)s | %(message)s"
        )
        stream_handler.setFormatter(formatter)
        stream_handler.addFilter(RequestIdFilter())
        logger.addHandler(stream_handler)

        # OpenSearch handler
        os_handler = OpenSearchHandler(
            url="http://wegathon-opensearch.uzlas.com:2021/teams-ingest-pipeline/ingest",
            username=os.getenv("opensearch_user"),  
            password=os.getenv("opensearch_key")  
        )
        os_handler.setFormatter(formatter)
        os_handler.addFilter(RequestIdFilter())
        logger.addHandler(os_handler)

    return logger

# Global logger
app_logger = setup_logger("ai_trip_planner")
