class Chat(BaseModel):
    id: str
    messages: list[Message]
    created_at: datetime
    updated_at: datetime

    def create_chat(self):
        self.id = str(uuid.uuid4())
        self.created_at = datetime.now()
        self.messages = []
        self.updated_at = datetime.now()
        return self