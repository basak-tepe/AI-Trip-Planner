from pydantic import BaseModel
from models.Activity import Activity
from datetime import date
from typing import List
from typing import Optional

"""

class Content(BaseModel):
    day:int #day number
    date:date #date for the day
    package_advice: str #advice for what to pack for the day
    day_activities: list[Activity] #this will be a list of activities for each day

    def to_json(self):
        return {
            "day": self.day,
            "date": self.date.isoformat(),
            "package_advice": self.package_advice,
            "day_activities": [activity.to_json() for activity in self.day_activities]
        }
"""


class Content(BaseModel):
    text:str #this will be the text content for each day
    link:Optional[str] = None #optional link for more info

    def to_json(self):
        return {
            "text": self.text,
            "link": self.link
        }



class ResponseMessage(BaseModel):
    role: str
    content: List[Content] #this will be  list of each day's plan and each day's plan will be a list of activities
    plan : Optional[str] = None  # Optional overall plan summary
    chat_id: str 

    def to_json(self):
        return {
            "role": self.role,
            "content": [content.to_json() for content in self.content],
            "chat_id": self.chat_id,
            "plan": self.plan
        }

class RequestMessage(BaseModel):
    role: str
    content: str #this will be the user input prompt
    chat_id: str

    def to_json(self):
        return {
            "role": self.role,
            "content": self.content,
            "chat_id": self.chat_id
        }

    

class OutputResponse:
    plan: Optional[str] = None # Optional overall plan summary
    contents: List[Content] = [] 
