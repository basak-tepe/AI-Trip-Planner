from agents import Agent, Runner, handoff
from agents.mcp import MCPServerStdio
from models.Message import Content, OutputResponse
from typing import List, Optional
import os
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
    This tool fetches the list of options from MCP server by using the tools flight_search, hotel_search, car_search based on user preferences and budget. Just return the response from MCP server. 
    Args:
        departure_location (str): The location from which the user is departing.
        arrival_location (str): The location to which the user is arriving.
        departure_date (str): The date of departure in YYYY-MM-DD format.
        return_date (str): The date of return in YYYY-MM-DD format.
        preferences (str): User preferences and budget information.
    """
    runner = MCPAgentRunner()
    response = await runner.run(f"Get me flight and hotel and car rental options based on the following details:\n Departure Location: {departure_location}\n Arrival Location: {arrival_location}\n Departure Date: {departure_date}\n Return Date: {return_date}\n Preferences: {preferences}")
    print("MCP Response:", response)
    await runner.close()
    return response


@function_tool
async def pick_options(option_list : str, preferences:str) -> List[Content]:
    """
     This tool picks the most related option within the text field of each content, it should pick one flight, one hotel, one car rental option based on user preferences and budget.
    Args:
        option_list str: List of flight, hotel, car rental options in string format.
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
async def trip_plan(selected_options:str,preferences:str) -> str:
    """
    This tool summarizes the selected options and plans the trip day by day by dividing the days into 3 parts(morning, afternoon, evening) and suggest activities and food suggestions for each part of the day.( Consider selected flight hours before deciding on the activities for the first and last day)
    Args:
        selected_options (str): List of selected flight,hotel and car rental option containing text and optional link. This info is returned from pick_options tool.
        preferences (str): User preferences and budget information.
    Returns:
        str: A summary of the trip plan. day by day plan with activities and food suggestions. provide the plan in a detailed  and clean manner.
    """
    #TODO: llm based implementation
    agent = Agent(
        name="TripPlannerAgent",
        instructions="Using the selected options for flight, hotel, and car rental, create a day-by-day trip plan  Divide each day into three parts: morning, afternoon, and evening. Suggest activities and food options for each part of the day, taking into account the flight times on the first and last days. An example format is as follows:  ---\n## Rome, Italy Itinerary (10\u201315 October 2025)\n\n---\n### Selected Options:\n- **Flight:** Direct Pegasus; Istanbul SAW \u2192 Rome FCO, Depart 10 Oct 09:05, Return 15 Oct 14:50, comfort economy with checked bag and meal.\n- **Hotel:** Otivm Hotel (Central Rome, walkable to sites, rooftop views, Italian breakfast, 9.4 score).\n- **Car Rental:** Toyota RAV4 Automatic (National, Fiumicino Airport pickup/dropoff, comfortable for city/country).\n\n---\n## Day 1 (10 Oct): Arrival & City First Bites\n**Morning:**\n- Arrive FCO 10:40, pick up car, drive to Otivm Hotel, check in and freshen up.\n\n**Afternoon:**\n- Walk to Mercato Centrale for lunch (sample Roman street food).\n- Explore Piazza Venezia, Capitoline Hill views, Fori Imperiali.\n- Espresso/pastry break at Antico Caff\u00e8 Greco or Roscioli Caff\u00e8.\n\n**Evening:**\n- Dinner at Trattoria Pennestri (Testaccio, Roman cuisine).\n- Stroll by the illuminated Colosseum.\n- Return to Otivm Hotel for rest.\n\n---\n## Day 2 (11 Oct): Classic Rome & Cuisine\n**Morning:**\n- Rooftop breakfast at hotel, then walk to the Pantheon, Piazza Navona, Trevi Fountain.\n- Gelato at Giolitti.\n\n**Afternoon:**\n- Lunch at Armando al Pantheon (reservations recommended).\n- Visit Galleria Doria Pamphilj, browse Campo de' Fiori market.\n- Coffee at Sant\u2019Eustachio Il Caff\u00e8.\n\n**Evening:**\n- Dinner at Roscioli Salumeria con Cucina (authentic Roman dishes).\n- Evening stroll along the Tiber River.",
        output_type=str,
        model="gpt-4o-mini"
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
        
        IMPORTANT: You have access to the full conversation history. Use this context to understand the user's preferences, previous requests, and any information that has been discussed. Reference previous messages when making recommendations and planning the trip.
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


async def run_travel_agent(input_text: str, conversation_history: Optional[List[dict]] = None):
    """Run the travel agent with the given input text and conversation history."""
    # Build context from conversation history if provided
    context = input_text
    if conversation_history:
        context_parts = []
        for message in conversation_history:
            role = message["role"]
            content = message["content"]
            if role == "user":
                context_parts.append(f"User: {content}")
            elif role == "assistant":
                context_parts.append(f"Assistant: {content}")
        context_parts.append(f"User: {input_text}")
        context = "\n".join(context_parts)
    
    result = await Runner.run(travelAgent, input=context)
    return result.final_output



if __name__ == "__main__":
    import asyncio
    user_input = "10 kasım ankara-istanbul uçuşlarını göster"
    output = asyncio.run(run_travel_agent(user_input))
    print(output)




