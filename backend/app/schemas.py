from pydantic import BaseModel, Field
from datetime import datetime
import uuid
from typing import List
from models.Message import Content

class RequestMessageSchema(BaseModel):
    role : str = "user"
    content: str  # List of each day's plan as strings

class ResponseMessageSchema(BaseModel):
    role: str = "assistant"
    content: List[Content]  # List of each day's plan as strings

class ChatSchema(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    messages: List[ResponseMessageSchema] = Field(default_factory=list)

