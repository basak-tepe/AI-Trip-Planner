from pydantic import BaseModel
from models.Activity import Activity
from datetime import date
from typing import List

class Content(BaseModel):
    day:int #day number
    date:date #date for the day
    package_advice: str #advice for what to pack for the day
    day_activities: list[Activity] #this will be a list of activities for each day
class Message(BaseModel):
    role: str
    content: List[Content] #this will be  list of each day's plan and each day's plan will be a list of activities
    chat_id: str 

# Example usage

msg_example = Message(
    role="assistant",
    content=[
        Content(
            day=1,
            date="2025-10-10",
            package_advice="Pack comfortable walking shoes, a hat, sunscreen, and a reusable water bottle.",
            day_activities=[
                Activity(
                    activity="Visit the Louvre",
                    time="morning",
                    location="museum",
                    notes="Buy tickets in advance to skip the line."
                ),
                Activity(
                    activity="Lunch at Le Meurice",
                    time="afternoon",
                    location="restaurant",
                    notes="Try the tasting menu for a full experience."
                )
            ]
        ),
        Content(
            day=2,
            date="2025-10-11",
            package_advice="Carry a light raincoat and an umbrella, just in case.",
            day_activities=[
                Activity(
                    activity="Seine River Cruise",
                    time="morning",
                    location="river",
                    notes="Opt for a guided tour to learn about the landmarks."
                ),
                Activity(
                    activity="Explore Montmartre",
                    time="afternoon",
                    location="neighborhood",
                    notes="Visit the Sacré-Cœur and enjoy street performances."
                )
            ]
        )
    ],
    chat_id="123e4567-e89b-12d3-a456-426614174000"
)
