from agents import Agent
from agents.mcp import MCPServerStdio
from models.Message import Content, OutputResponse
import os
from tools import pick_options, trip_plan
from dotenv import load_dotenv

load_dotenv(override=True)

# Travel agent instructions
travel_instructions = """You are an AI travel assistant that helps users plan their trips. 
        You can use the following tools to assist with travel-related queries:
        - flight_search: Search for flights based on given filters if any, each flight information should be provided item by item in the text field. 
        - car_search: Search for rental cars based on given filters if any, each car information should be provided item by item in the text field.
        - bus_search: Search for bus tickets based on given filters if any, each bus information should be provided item by item in the text field.
        - hotel_search: Search for hotels based on given filters if any, each hotel information should be provided item by item in the text field, if there is a related jpg image link for the hotel, hotel room etc provide it in the link field.
        - flight_weather_forecast: Get weather forecast for a specific travel. 
        After getting various choices from each tool call pick_options tool to select the most suitable single option from each tool result.(one flight departure and return, one car rental option, one hotel option) based on user preferences and budget.
        Finally plan the whole trip with "trip_plan" tool day by day by dividing the days into 3 parts(morning, afternoon, evening) and suggest activities and food suggestions for each part of the day.( Consider selected flight hours before deciding on the activities for the first and last day)
        """


class TravelAgent(Agent):
    def __init__(self, mcp_server: MCPServerStdio = None):
        # If no MCP server provided, create one
        if mcp_server is None:
            mcp_server = MCPServerStdio(
                name="enuygun-mcp",
                params={"command": "npx", "args": ["-y", "mcp-remote", "https://mcp.enuygun.com/mcp"]},
                client_session_timeout_seconds=60.0,
                cache_tools_list=True,
                max_retry_attempts=2,
                retry_backoff_seconds_base=2.0
            )
        
        super().__init__(
            name="TravelAgent",
            instructions=travel_instructions,
            mcp_servers=[mcp_server],
            tools=[pick_options, trip_plan],
            output_type=OutputResponse
        )


# Convenience instance for import
travelAgent = TravelAgent()

