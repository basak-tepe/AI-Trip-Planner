from pydantic import BaseModel
from datetime import datetime
import uuid
from typing import List, Optional
from .Message import Message
import json
import os
import dotenv

dotenv.load_dotenv()
DB_FILE = os.getenv("DB_FILE", "db.json")
CHATS_KEY = "chats"

class Chat(BaseModel):
    id: str
    messages: List[Message]
    created_at: datetime
    updated_at: datetime

    @classmethod
    def create_chat(cls):
        """Create a new chat instance"""
        chat = cls(
            id=str(uuid.uuid4()),
            messages=[],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        chat._save_to_db()
        return chat
    
    def add_message(self, message: Message):
        """Add a message to the chat and save to database"""
        self.messages.append(message)
        self.updated_at = datetime.now()
        self._save_to_db()
        return self
    
    def to_json(self):
        return {
            "id": self.id,
            "messages": [message.dict() for message in self.messages],
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
    
    @staticmethod
    def get_chat(chat_id: str) -> Optional['Chat']:
        """Get a specific chat by ID"""
        try:
            with open(DB_FILE, "r") as file:
                data = json.load(file)
                chats = data.get(CHATS_KEY, [])
                for chat_data in chats:
                    if chat_data.get("id") == chat_id:
                        # Convert dict back to Chat object
                        return Chat(
                            id=chat_data["id"],
                            messages=[Message(**msg) for msg in chat_data.get("messages", [])],
                            created_at=datetime.fromisoformat(chat_data["created_at"]),
                            updated_at=datetime.fromisoformat(chat_data["updated_at"])
                        )
        except (FileNotFoundError, json.JSONDecodeError, KeyError):
            pass
        return None

    @staticmethod
    def delete_chat(chat_id: str) -> bool:
        """Delete a chat by ID"""
        try:
            with open(DB_FILE, "r") as file:
                data = json.load(file)
            
            chats = data.get(CHATS_KEY, [])
            # Filter out the chat with the given ID
            original_length = len(chats)
            chats = [chat for chat in chats if chat.get("id") != chat_id]
            
            if len(chats) < original_length:
                # Chat was found and removed
                data[CHATS_KEY] = chats
                with open(DB_FILE, "w") as file:
                    json.dump(data, file, indent=2)
                return True
            return False
        except (FileNotFoundError, json.JSONDecodeError, KeyError):
            return False

    @staticmethod
    def get_chats() -> List[dict]:
        """Get all chats"""
        try:
            with open(DB_FILE, "r") as file:
                data = json.load(file)
                return data.get(CHATS_KEY, [])
        except (FileNotFoundError, json.JSONDecodeError, KeyError):
            return []

    def _save_to_db(self):
        """Save chat to database"""
        try:
            # Try to read existing data
            try:
                with open(DB_FILE, "r") as file:
                    data = json.load(file)
            except (FileNotFoundError, json.JSONDecodeError):
                data = {CHATS_KEY: []}
            
            # Ensure chats key exists
            if CHATS_KEY not in data:
                data[CHATS_KEY] = []
            
            # Check if chat already exists
            chats = data[CHATS_KEY]
            chat_exists = False
            for i, existing_chat in enumerate(chats):
                if existing_chat.get("id") == self.id:
                    chats[i] = self.to_json()
                    chat_exists = True
                    break
            
            # If chat doesn't exist, add it
            if not chat_exists:
                chats.append(self.to_json())
            
            # Write back to file
            with open(DB_FILE, "w") as file:
                json.dump(data, file, indent=2)
                
        except Exception as e:
            print(f"Error saving chat to database: {e}")




