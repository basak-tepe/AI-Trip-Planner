from fastapi import FastAPI
from fastapi import HTTPException
from dotenv import load_dotenv
import os 
import httpx
load_dotenv()

app = FastAPI(title="AI Trip Planner API")

MCP_BASE_URL = os.getenv("mcp_base_url")

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
