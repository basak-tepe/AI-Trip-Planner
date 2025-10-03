import os
from dotenv import load_dotenv
from langchain.agents import initialize_agent, Tool, AgentType
from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.utilities import RequestsWrapper

# Load env vars
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MCP_BASE_URL = os.getenv("mcp_base_url")

# LLM
llm = ChatOpenAI(
    temperature=0,
    model="gpt-4",
    openai_api_key=OPENAI_API_KEY,
)

# Memory
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

# HTTP client
http = RequestsWrapper()

# Tools
def get_resources(_: str = None):
    response = http.get(f"{MCP_BASE_URL}/resources")
    return response 

tools = [
    Tool(
        name="get_resources",
        func=get_resources,
        description="Useful for fetching a list of resources from the MCP API."
    ),
]

# Travel agent (using built-in conversational-react-description prompt)
travel_agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
    verbose=True,
    memory=memory,
)

# Wrapper
def plan_trip(prompt: str) -> str:
    return travel_agent.run(prompt)

if __name__ == "__main__":
    print(plan_trip("I want to visit Paris and London. Can you suggest some places to stay?"))