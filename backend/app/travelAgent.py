import os
from dotenv import load_dotenv
from agents import Agent, ModelSettings, function_tool, HostedMCPTool, Runner
import httpx
import http 
# Load env vars
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MCP_BASE_URL = os.getenv("mcp_base_url")

class TravelAgent(Agent):
    def __init__(self):
        self.model_settings = ModelSettings(
            model="gpt-4o",
            temperature=0.7,
            max_tokens=1000,
            api_key=OPENAI_API_KEY
        )
    flight_search_tool= HostedMCPTool(
                tool_config={
                    "type": "mcp",
                    "name": "enuygun",
                    "description": "This is a tool that allows you to search for flights and hotels.",
                    "server_url": os.getenv("mcp_base_url"),
                    "require_approval": "never",
                }
            )
    agent = Agent(
        name="Assistant",
        instructions="You're a helpful travel planning assistant. You can help users plan trips, find flights, and suggest activities.",

        
    )

    async def get_response(self, user_message: str):
        response = await Runner.run(
            starting_agent=self.agent,
            input=user_message
        )
        print(response.final_output)
        return response
    
travel_agent = TravelAgent()

async def main():
    user_message = "I want to plan a trip to istanbul from Ankara on 20th october. Can you help me find flights and suggest activities?"
    response = await travel_agent.get_response(user_message)
    print("Agent Response:", response)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())



    






