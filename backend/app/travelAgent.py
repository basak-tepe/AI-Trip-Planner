import asyncio
from typing import List, Optional
from agents import Agent, Runner
from agents.mcp import MCPServerStdio
from models.Message import Content, OutputResponse
import os
from dotenv import load_dotenv
load_dotenv(override=True)
from agents.mcp.util import create_static_tool_filter, MCPUtil
from agents import tool
from tools import pick_options,trip_plan 


OPENAI_API_KEY=os.getenv("OPENAI_API_KEY")

instructions_old = """You are an AI travel assistant that helps users plan their trips. If you dont have the information of departure date,arrival date,departure location and destination and budget information and car rental preference you must first ask user to provide the missing information and you dont proceed to next steps.
        You can use the following tools to assist with travel-related queries:
        - flight_search: Search for flights based on user criteria. Return results based on few criteria. First ask the user if she wants to see based on different airlines,based on price,based on arrival time or departure time. Then order the results accordingly.
        - car_search: Search for rental cars based on user criteria. Return results based on few criteria. First ask the user if she wants to see based on different car types(economy,luxury,suv),based on price,based on rental company. Then order the results accordingly.
        - bus_search: Search for bus tickets based on user criteria. Return results based on few criteria. First ask the user if she wants to see based on different bus companies,based on price,based on arrival time or departure time. Then order the results accordingly.
        - hotel_search: Search for hotels based on user criteria. Return results based on few criteria. First ask the user if she wants to see based on different hotel types(budget,luxury),based on price,based on rating. Then order the results accordingly.
        - flight_weather_forecast: Get weather forecast for a specific travel. First ask the user for the destination and travel dates.
        After getting various choices from each tool call pick_options tool to select the most suitable single option from each tool result.(one flight departure and return, one car rental option, one hotel option) based on user preferences and budget.
        Finally plan the whole trip day by day by dividing the days into 3 parts(morning, afternoon, evening) and suggest activities and food suggestions for each part of the day.( Consider selected flight hours before deciding on the activities for the first and last day)
        """

instructions = """You are an AI travel assistant that helps users plan their trips. 
        You can use the following tools to assist with travel-related queries:
        - flight_search: Search for flights based on given filters if any, each flight information should be provided item by item in the text field. 
        - car_search: Search for rental cars based on given filters if any, each car information should be provided item by item in the text field.
        - bus_search: Search for bus tickets based on given filters if any, each bus information should be provided item by item in the text field.
        - hotel_search: Search for hotels based on given filters if any, each hotel information should be provided item by item in the text field, if there is a related jpg image link for the hotel, hotel room etc provide it in the link field.
        - flight_weather_forecast: Get weather forecast for a specific travel. 
        After getting various choices from each tool call pick_options tool to select the most suitable single option from each tool result.(one flight departure and return, one car rental option, one hotel option) based on user preferences and budget.
        Finally plan the whole trip with "trip_plan" tool day by day by dividing the days into 3 parts(morning, afternoon, evening) and suggest activities and food suggestions for each part of the day.( Consider selected flight hours before deciding on the activities for the first and last day)
        """
class MCPAgentRunner:
    def __init__(self, 
                 name: str = "AssistantWithMCP",
                 instructions: str = instructions,
                 command: str = "npx",
                 args: Optional[list] = None,
                 ):
        if args is None:
            args = ["-y", "mcp-remote", "https://mcp.enuygun.com/mcp"]

        self.command = command
        self.args = args
        self.agent_name = name
        self.instructions = instructions
        self.mcp_server: Optional[MCPServerStdio] = None
        self.agent: Optional[Agent] = None

    async def _setup(self):
        """Initialize MCP server and agent."""
        self.mcp_server = MCPServerStdio(
            name="enuygun-mcp",
            params={"command": self.command, "args": self.args},
            client_session_timeout_seconds=60.0,  # wait up to 60 seconds
            cache_tools_list=True,                 # optional, avoids round trips
            max_retry_attempts=2,                  # optional, adds retries
            retry_backoff_seconds_base=2.0        # optional, adds exponential backoff on retries
        )
        await self.mcp_server.__aenter__()  # manually enter async context

        self.agent = Agent(
            name=self.agent_name,
            instructions=self.instructions,
            mcp_servers=[self.mcp_server],
            tools = [pick_options,trip_plan],
            output_type=OutputResponse
        )
    async def run(self, input_text: str):
        """Run the agent with the given input text."""
        if self.mcp_server is None or self.agent is None:
            await self._setup()
            result=await self.agent.get_mcp_tools(run_context=None)
            for tool in result:
                print(f"Available tool: {tool.name}")
                print(f"Description: {tool.description}")
                print(f"Input schema: {tool.params_json_schema}")
                print("-----")
                
            
        try:
            result = await Runner.run(starting_agent=self.agent, input=input_text)
            return result.final_output
        finally:
            await self.close()

    async def close(self):
        """Clean up MCP server properly."""
        if self.mcp_server:
            await self.mcp_server.__aexit__(None, None, None)
            self.mcp_server = None
            self.agent = None


# Example usage
if __name__ == "__main__":
    async def main():
        session = MCPAgentRunner()
        """
         list_of_tools=["flight_search","car_search","bus_search","hotel_search","flight_weather_forecast"]
        for tool in list_of_tools:
            print(f"Available tool: {tool}")
            result = await MCPUtil.invoke_mcp_tool(server=session.mcp_server, tool = tool, context = None, input_json=None)
            print(f"Invocation result for {tool}: {result}")   
        """
       
        start_time = asyncio.get_event_loop().time()
        response = await session.run("istanbuldan ankaraya 3 kasım 2025'de gidiş, 10 kasım 2025'de dönüş uçak bileti, bu tarihler arasında ankarada bir otel bul, bir araba kirala ve bu tatili planla ")
        end_time = asyncio.get_event_loop().time()
        print(f"Response time: {end_time - start_time} seconds")
        print("Final output:", response)
        await session.close()

    asyncio.run(main())

