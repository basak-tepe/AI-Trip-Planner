class Activity(BaseModel):
    activity: str #activity title like "Visit the Louvre"
    time: str  #either morning, afternoon, evening or full day
    location: str #can be museum, restaurant, park, cafe hotel, etc.
    notes: str #any suggestions for the activity what to eat, reservations,taking a photo, any other tips etc.
    package_advice : str #any advice for what to bring to the activity like a hat, sunscreen, a bottle of water, etc.

