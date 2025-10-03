from pydantic import BaseModel
from datetime import datetime
import uuid
from models.Message import Message

class Chat(BaseModel):
    id: str
    messages: list[Message]
    created_at: datetime
    updated_at: datetime

    def create_chat(self):
        self.id = str(uuid.uuid4())
        self.created_at = datetime.now()
        self.messages = []
        self.updated_at = datetime.now()
        return self
    
    def add_message(self, message: Message):
        self.messages.append(message)
        self.updated_at = datetime.now()
        return self
    
    def to_json(self):
        return {
            "id": self.id,
            "messages": [message.dict() for message in self.messages],
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
    
    @staticmethod
    def get_chat(chat_id: str):
        #fetch chat from database or in-memory store
        pass

    @staticmethod
    def delete_chat(chat_id: str):
        #delete chat from database or in-memory store
        pass

    @staticmethod  #static method to get all chats
    def get_chats():
        #fetch all chats from database or in-memory store
        pass




