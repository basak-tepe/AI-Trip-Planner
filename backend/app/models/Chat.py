from datetime import datetime
import uuid
from typing import List, Optional
from .Message import RequestMessage, ResponseMessage
import json
import os
import dotenv
# from travelAgent import TravelAgent
from guardianAgent import run_guardian_agent
from schemas import RequestMessageSchema, ChatSchema, ResponseMessageSchema
from models.Message import OutputResponse
from logger import app_logger

dotenv.load_dotenv()
DB_FILE = os.getenv("DB_FILE", "db.json")
CHATS_KEY = "chats"

# factory for messages
def message_factory(msg: dict):
    if msg.get("role") == "user":
        return RequestMessage(**msg)
    elif msg.get("role") == "assistant":
        return ResponseMessage(**msg)
    else:
        raise ValueError(f"Unknown role in message: {msg.get('role')}")
    
def message_schema_factory(msg: RequestMessage| ResponseMessage):
    if msg.role == "user":
        return RequestMessageSchema(role=msg.role, content=msg.content)
    elif msg.role == "assistant":
        return ResponseMessageSchema(role=msg.role, content=msg.content, plan=getattr(msg, 'plan', None))
    else:
        raise ValueError(f"Unknown role in message: {msg.role}")

class Chat:
    def __init__(
        self,
        id: Optional[str] = None,
        messages: Optional[List[RequestMessage| ResponseMessage]] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
    ):
        self.id = id or str(uuid.uuid4())
        self.messages = messages or []
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

        # runtime-only attribute
        #self._agent = TravelAgent()
        #self.guardian_agent = GuardianAgent()
        app_logger.info(f"Chat initialized with ID={self.id}")
        self._save_to_db()
 
    
    async def add_message(self, message: RequestMessageSchema) -> OutputResponse:
        """Add a message to the chat and save to database"""
        msg= RequestMessage(role=message.role, content=message.content, chat_id=self.id)
        self.messages.append(msg)
        self.updated_at = datetime.now()
        #
        # Build conversation history from existing messages
        conversation_history = []
        for existing_msg in self.messages[:-1]:  # Exclude the current message we just added
            if existing_msg.role == "user":
                conversation_history.append({"role": "user", "content": existing_msg.content})
            elif existing_msg.role == "assistant":
                # Convert Content objects to string for history
                content_str = existing_msg.content
                if isinstance(content_str, list):
                    content_str = str(content_str)
                conversation_history.append({"role": "assistant", "content": content_str})
        
        # Call the agent with conversation history
        response = await run_guardian_agent(message.content, conversation_history)
        response_msg= ResponseMessage(role="assistant", content=response.contents, chat_id=self.id, plan=response.plan if hasattr(response, 'plan') else None)
        self.messages.append(response_msg)
        app_logger.info(f"Message added to chat ID={self.id}. Total messages now: {len(self.messages)}")
        self._save_to_db()
        return response #return the response to the user
    
    def to_json(self):
        return {
            "id": self.id,
            "messages": [message.to_json() for message in self.messages],
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
    
    def to_schema(self) -> ChatSchema:
        return ChatSchema(
            id=self.id,
            created_at=self.created_at,
            updated_at=self.updated_at,
            messages=[message_schema_factory(msg) for msg in self.messages]
        )

        
    
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
                        chat = Chat(
                            id=chat_data["id"],
                            messages=[message_factory(msg) for msg in chat_data.get("messages", [])],
                            created_at=datetime.fromisoformat(chat_data["created_at"]),
                            updated_at=datetime.fromisoformat(chat_data["updated_at"])
                        )
                        # Don't save to DB again since we're loading from DB
                        #chat._agent = TravelAgent()
                        app_logger.info(f"Chat fetched with ID={chat_id}")
                        return chat
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
                app_logger.info(f"Chat deleted with ID={chat_id}")
                return True
            app_logger.warning(f"Chat with ID={chat_id} not found for deletion")
            return False
        except (FileNotFoundError, json.JSONDecodeError, KeyError):
            app_logger.error(f"Error deleting chat with ID={chat_id}")
            return False

    @staticmethod
    def get_chats() -> List[Optional['Chat']]:
        """Get all chats"""
        try:
            with open(DB_FILE, "r") as file:
                data = json.load(file)
                # Convert each chat dict back to Chat object
                chats = []
                for chat_data in data.get(CHATS_KEY, []):
                    chat = Chat(
                        id=chat_data["id"],
                        messages=[message_factory(msg) for msg in chat_data.get("messages", [])],
                        created_at=datetime.fromisoformat(chat_data["created_at"]),
                        updated_at=datetime.fromisoformat(chat_data["updated_at"])
                    )
                    # Initialize agent for each chat
                    #chat._agent = TravelAgent()
                    chats.append(chat)
                app_logger.info(f"Total chats fetched: {len(chats)}")
                return chats
        except (FileNotFoundError, json.JSONDecodeError, KeyError):
            app_logger.warning("No chats found in database")
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
            app_logger.error(f"Failed to save chat to database: {e}")




