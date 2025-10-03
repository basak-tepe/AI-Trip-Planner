from pydantic import BaseModel
from models.Activity import Activity
from datetime import date

class Content(BaseModel):
    days: list[date]
    day_activities: list[Activity] #this will be a list of activities for each day
class Message(BaseModel):
    role: str
    content: Content #this will be  list of each day's plan and each day's plan will be a list of activities
    chat_id: str 


