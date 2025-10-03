from agents import Agent, handoff, Runner
from agents.mcp import MCPServerStdio
from models.Message import Content, OutputResponse
from dotenv import load_dotenv
from agents import function_tool
from models.Message import Content
from typing import List
from mcp_agent_runner import MCPAgentRunner
from openai import OpenAI
from datetime import datetime
client = OpenAI()



@function_tool
async def get_mcp_lists(departure_location:str, arrival_location:str, departure_date:str, return_date:str, preferences:str) -> None:
    """
    This tool fetches the list of options from MCP server for flights, hotels, car rentals based on user preferences and budget.
    Args:
        None
    """
    runner = MCPAgentRunner()
    response = await runner.run(f"Get me flight and hotel and car rental options based on the following details:\n Departure Location: {departure_location}\n Arrival Location: {arrival_location}\n Departure Date: {departure_date}\n Return Date: {return_date}\n Preferences: {preferences}")
    print("MCP Response:", response)
    await runner.close()
    return response


@function_tool
async def pick_options(option_list : List[Content], preferences:str) -> List[Content]:
    """
     This tool picks the most related option within the text field of each content, it should pick one flight, one hotel, one car rental option based on user preferences and budget.
    Args:
        option_list (List[Content]): List of Content objects containing text and optional link.
        preferences (str): User preferences and budget information.
    Returns:
        List[Content]: A list containing the most related options. Like 
        [
            Content(text="Selected flight's details...", link=None),
            Content(text="Selected hotel's details...", link="http://image_link.jpg"),
            Content(text="Selected car rental's details...", link=None)
        ]
    """
    #TODO: llm based implementation
    
    agent = Agent(
        name="OptionPickerAgent",
        instructions="From the following list of options of flights, hotels, and car rentals, pick the most suitable single option from each category based on the user's preferences and budget. Provide your selections in a concise manner.",
        output_type=List[Content]
    )
    response = await Runner.run(agent, input=f"Option list: {option_list}\n User preferences and budget: {preferences}")
    return response.final_output


@function_tool
async def trip_plan(selected_options:List[Content],preferences:str) -> str:
    """
    This tool summarizes the selected options and plans the trip day by day by dividing the days into 3 parts(morning, afternoon, evening) and suggest activities and food suggestions for each part of the day.( Consider selected flight hours before deciding on the activities for the first and last day)
    Args:
        selected_options (List[Content]): List of selected Content objects containing text and optional link. This info is returned from pick_options tool.
        preferences (str): User preferences and budget information.
    Returns:
        str: A summary of the trip plan. day by day plan with activities and food suggestions.
    """
    #TODO: llm based implementation
    agent = Agent(
        name="TripPlannerAgent",
        instructions="Using the selected options for flight, hotel, and car rental, create a detailed day-by-day trip plan. Divide each day into three parts: morning, afternoon, and evening. Suggest activities and food options for each part of the day, taking into account the flight times on the first and last days.",
        output_type=str
    )
    response = await Runner.run(agent, input=f"Selected options: {selected_options}\n User preferences and budget: {preferences}")
    return response.final_output

load_dotenv(override=True)

# Travel agent instructions
travel_instructions_old = """You are an AI travel assistant that helps users plan their trips. 
        You can use the following tools to assist with travel-related queries:
        - flight_search: Search for flights based on given filters if any, each flight information should be provided item by item in the text field. 
        - car_search: Search for rental cars based on given filters if any, each car information should be provided item by item in the text field.
        - bus_search: Search for bus tickets based on given filters if any, each bus information should be provided item by item in the text field.
        - hotel_search: Search for hotels based on given filters if any, each hotel information should be provided item by item in the text field, if there is a related jpg image link for the hotel, hotel room etc provide it in the link field.
        - flight_weather_forecast: Get weather forecast for a specific travel. 
        After getting various choices from each tool call pick_options tool to select the most suitable single option from each tool result.(one flight departure and return, one car rental option, one hotel option) based on user preferences and budget.
        Finally plan the whole trip with "trip_plan" tool day by day by dividing the days into 3 parts(morning, afternoon, evening) and suggest activities and food suggestions for each part of the day.( Consider selected flight hours before deciding on the activities for the first and last day)
        """

travel_instructions = """You are an AI travel assistant that helps users plan their trips. Todays date is 5 october 2025.
       -You will use get_mcp_lists tool to fetch the list of options from MCP server for flights, hotels, car rentals.
        After getting lists from get_mcp_lists, call pick_options tool to select the most suitable single option from each tool result. (one flight departure and return, one car rental option, one hotel option) based on user preferences and budget.
        Finally plan the whole trip with trip_plan tool day by day by dividing the days into 3 parts(morning, afternoon, evening) and suggest activities and food suggestions for each part of the day.( Consider selected flight hours before deciding on the activities for the first and last day)
        """

class TravelAgent(Agent):
    def __init__(self, mcp_server: MCPServerStdio = None):
        # If no MCP server provided, create one
        #get mcp server results from MCPAgentRunner

        
        super().__init__(
            name="TravelAgent",
            instructions=travel_instructions,
            #mcp_servers=[mcp_server],
            tools=[get_mcp_lists,pick_options,trip_plan],
            output_type=OutputResponse
        )



# Convenience instance for import
travelAgent = TravelAgent()

async def run_travel_agent(input_text: str):
    """Run the travel agent with the given input text."""
    result = await Runner.run(travelAgent, input=input_text)
    return result.final_output

if __name__ == "__main__":
    import asyncio
    user_input = "10 kasım ankara-istanbul uçuşlarını göster"
    output = asyncio.run(run_travel_agent(user_input))
    print(output)


