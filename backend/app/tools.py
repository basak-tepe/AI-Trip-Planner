from agents import function_tool
from models.Message import Content
from typing import List


@function_tool
def pick_options(option_list : List[Content], preferences:str) -> List[Content]:
    """
     This tool picks the most related option within the text field of each content, it should pick one flight, one hotel, one car rental option based on user preferences and budget.
    Args:
        option_list (List[Content]): List of Content objects containing text and optional link.
        preferences (str): User preferences and budget information.
    Returns:
        List[Content]: A list containing the most related options.
    """
    #TODO: llm based implementation
    return 

@function_tool
def trip_plan(selected_options:List[Content],preferences:str) -> str:
    """
    This tool summarizes the selected options and plans the trip day by day by dividing the days into 3 parts(morning, afternoon, evening) and suggest activities and food suggestions for each part of the day.( Consider selected flight hours before deciding on the activities for the first and last day)
    Args:
        selected_options (List[Content]): List of selected Content objects containing text and optional link. This info is returned from pick_options tool.
        preferences (str): User preferences and budget information.
    Returns:
        str: A summary of the trip plan. day by day plan with activities and food suggestions.
    """
    #TODO: llm based implementation
    return "Trip plan summary"



