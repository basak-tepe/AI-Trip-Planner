from fastapi import FastAPI
from fastapi import HTTPException
from dotenv import load_dotenv
import os 
import httpx
load_dotenv()
from pydantic import BaseModel
from datetime import datetime
from models import Chat, Message, Content, DayActivity, Activity, Date

class Message(BaseModel):
    role: str
    content: Content #this will be  list of each day's plan and each day's plan will be a list of activities
    chat_id: str 

class Content(BaseModel):
    days: list[Date]
    day_activities: list[Activity] #this will be a list of activities for each day

app = FastAPI(title="AI Trip Planner API")

MCP_BASE_URL = os.getenv("mcp_base_url")

#this backend will add new chat delete existing chat, get existing chats and get a specific chat

#implement them one by one 

@app.post("/api/chat"):
async def add_chat(chat: Chat):
    new_chat= Chat.create_chat()
    new_chat.updated_at = datetime.now()
    return new_chat.to_json()

@app.delete("/api/chat/{chat_id}"):
async def delete_chat(chat_id: str):
    return {"message": "Chat deleted successfully"}

@app.get("/api/chats"):
async def get_chats():
    return {"message": "Chats fetched successfully"}

@app.get("/api/chat/{chat_id}"):
async def get_chat(chat_id: str):
    #returns chat with all messages
    return {"message": "Chat fetched successfully"}

@app.post("/api/chat/{chat_id}/message"):
async def add_message(chat_id: str, message: Message):
    return {"message": "Message added successfully"}

    



@app.get("/mcp/resources")
async def get_resources():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{MCP_BASE_URL}/resources")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok"}
