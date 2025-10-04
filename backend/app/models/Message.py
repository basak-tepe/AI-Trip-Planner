from pydantic import BaseModel
from .Activity import Activity
from datetime import date
from typing import List
from typing import Optional, Union

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



class PlanItem(BaseModel):
    day_number: int
    hour: str
    activity_title: str
    activity_content: str


class ResponseMessage(BaseModel):
    role: str
    content: List[Content]
    plan : Optional[Union[str, List[PlanItem]]] = None
    chat_id: str 

    def to_json(self):
        return {
            "role": self.role,
            "content": [content.to_json() for content in self.content],
            "chat_id": self.chat_id,
            "plan": (
                [item.model_dump() for item in self.plan] if isinstance(self.plan, list) else self.plan
            )
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

    

class OutputResponse(BaseModel):
    plan: Optional[Union[str, List[PlanItem]]] = None
    contents: List[Content] = [] 
