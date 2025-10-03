from fastapi import FastAPI, Body
from fastapi import HTTPException
from dotenv import load_dotenv
import os 
load_dotenv()
from models.Chat import Chat
from schemas import RequestMessageSchema, ChatSchema, ResponseMessageSchema
from typing import List


app = FastAPI(title="AI Trip Planner API")

MCP_BASE_URL = os.getenv("mcp_base_url")

#this backend will add new chat delete existing chat, get existing chats and get a specific chat

#implement them one by one 

@app.post("/api/chat", response_model=ChatSchema)
async def add_chat():
    # create a runtime Chat instance
    new_chat = Chat()
    schema=new_chat.to_schema() #convert to schema for response
    print(f"New chat added: {schema}")
    return schema

@app.delete("/api/chat/{chat_id}")
async def delete_chat(chat_id: str) -> dict:
    deleted = Chat.delete_chat(chat_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Chat not found")
    print(f"Chat deleted: {chat_id}")
    return {f"message": "Chat with id {chat_id} deleted successfully"}

@app.get("/api/chats")
async def get_chats() -> List[ChatSchema]:
    chats = Chat.get_chats() #returns list of all chats, no user for now 
    print(f"Chats fetched: {chats}")
    schemas = [chat.to_schema() for chat in chats]
    return schemas
    

@app.get("/api/chat/{chat_id}")
async def get_chat(chat_id: str) -> ChatSchema:
    chat = Chat.get_chat(chat_id)
    print(f"Chat fetched: {chat}")
    #returns chat with all messages
    schema = chat.to_schema()
    return schema


@app.post("/api/chat/{chat_id}/message")
async def chat_with_llm(chat_id: str, message: RequestMessageSchema = Body(...)) -> ResponseMessageSchema:
    chat = Chat.get_chat(chat_id)
    response=await chat.add_message(message) #this will call the llm to generate a response
    response_schema=ResponseMessageSchema(role="assistant", content=response)
    return response_schema


@app.get("/health")
async def health_check():
    return {"status": "ok"}
