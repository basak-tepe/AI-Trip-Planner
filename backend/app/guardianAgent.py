from agents import Agent, handoff, Runner
from travelAgent import TravelAgent
from typing import List, Optional
from models.Message import Content, OutputResponse


guardian_instructions = """You are a guardian agent that ensures the user provides all necessary information for travel planning.
You must ensure the user provides the following information:
- Departure location
- Departure date
- Arrival date
- Arrival location
If any of this information is missing, you must ask the user to provide it before proceeding.

Once all information is provided, you will handoff the conversation to the travel planning agent."""


agent=TravelAgent()

travelAgentHandoff = handoff(
    agent=agent,
    tool_description_override="This tool is called once the user has provided all necessary travel information. It helps plan the trip based on the user's preferences and budget."
)

class GuardianAgent(Agent):
    def __init__(self):
        super().__init__(
            name="GuardianAgent",
            instructions=guardian_instructions,
            handoffs=[travelAgentHandoff],
            output_type=OutputResponse
        )


# convenience instance
guardian_agent = GuardianAgent()


async def run_guardian_agent(input_text: str):
    """Run the guardian agent with the given input text."""
    result = await Runner.run(guardian_agent, input=input_text)
    return result.final_output
