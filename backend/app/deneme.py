import asyncio
from typing import List, Optional
from agents import Agent, Runner
from agents.mcp import MCPServerStdio
from models.Message import Content
import os
from dotenv import load_dotenv
from agents.mcp.util import create_static_tool_filter


load_dotenv(override=True)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

class MCPAgentRunner:
    def __init__(self,
                 name: str = "SupervisorAgent",
                 instructions: str = "You are a supervisor agent. Depending on the user request, you may delegate tasks to specialized agents such as flight, car, bus, hotel, or weather search.",
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
        self.supervisor: Optional[Agent] = None

    async def _setup(self):
        """Initialize MCP server and create supervisor + specialized agents."""
        self.mcp_server = MCPServerStdio(
            name="enuygun-mcp",
            params={"command": self.command, "args": self.args},
            client_session_timeout_seconds=60.0,
            cache_tools_list=True,
            max_retry_attempts=2,
            retry_backoff_seconds_base=2.0
        )
        await self.mcp_server.__aenter__()  # start server connection

        # Specialized agents
        flight_agent = Agent(
            name="FlightSearchAgent",
            instructions="Specialized in searching for flights.",
            mcp_servers=[self.mcp_server],
            output_type=List[Content],
            tool_filter=create_static_tool_filter(allowed_tool_names=["flight_search"])
        )
        car_agent = Agent(
            name="CarSearchAgent",
            instructions="Specialized in searching for rental cars.",
            mcp_servers=[self.mcp_server],
            output_type=List[Content],
            tool_filter=create_static_tool_filter(allowed_tool_names=["car_search"])
        )
        bus_agent = Agent(
            name="BusSearchAgent",
            instructions="Specialized in searching for bus tickets.",
            mcp_servers=[self.mcp_server],
            output_type=List[Content],
            tool_filter=create_static_tool_filter(allowed_tool_names=["bus_search"])
        )
        hotel_agent = Agent(
            name="HotelSearchAgent",
            instructions="Specialized in searching for hotels.",
            mcp_servers=[self.mcp_server],
            output_type=List[Content],
            tool_filter=create_static_tool_filter(allowed_tool_names=["hotel_search"])
        )
        weather_agent = Agent(
            name="FlightWeatherAgent",
            instructions="Specialized in retrieving flight weather forecasts.",
            mcp_servers=[self.mcp_server],
            output_type=List[Content],
            tool_filter=create_static_tool_filter(allowed_tool_names=["flight_weather_forecast"])
        )

        # Supervisor agent — has all specialized agents as its tools
        self.supervisor = Agent(
            name=self.agent_name,
            instructions=self.instructions,
            subagents=[
                flight_agent,
                car_agent,
                bus_agent,
                hotel_agent,
                weather_agent,
            ],
            output_type=List[Content],
        )

    async def run(self, input_text: str):
        """Run the supervisor agent with the given input text."""
        if self.mcp_server is None or self.supervisor is None:
            await self._setup()
        try:
            result = await Runner.run(starting_agent=self.supervisor, input=input_text)
            return result.final_output
        finally:
            await self.close()

    async def close(self):
        """Clean up MCP server properly."""
        if self.mcp_server:
            await self.mcp_server.__aexit__(None, None, None)
            self.mcp_server = None
            self.supervisor = None


# Example usage
if __name__ == "__main__":
    async def main():
        session = MCPAgentRunner()
        start_time = asyncio.get_event_loop().time()

        # User just talks to the supervisor
        response = await session.run("İSTANBUL ANKARA 10 KASIM UÇAK BİLETİ")

        end_time = asyncio.get_event_loop().time()
        print(f"Response time: {end_time - start_time} seconds")
        print("Final output:", response)
        await session.close()

    asyncio.run(main())
