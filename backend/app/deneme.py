import asyncio
from typing import List, Optional
from agents import Agent, Runner
from agents.mcp import MCPServerSse   # <-- switched here
from models.Message import Content
import os
from dotenv import load_dotenv
load_dotenv(override=True)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


class MCPAgentRunner:
    def __init__(self,
                 name: str = "AssistantWithMCP",
                 instructions: str = "You can use the tools exposed by the enuygun MCP server.",
                 url: str = "https://mcp.enuygun.com/mcp",   # <-- SSE endpoint instead of npx
                 headers: Optional[dict] = None):
        if headers is None:
            headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}

        self.url = url
        self.headers = headers
        self.agent_name = name
        self.instructions = instructions
        self.mcp_server: Optional[MCPServerSse] = None
        self.agent: Optional[Agent] = None

    async def _setup(self):
        """Initialize MCP SSE server and agent."""
        self.mcp_server = MCPServerSse(
            name="enuygun-mcp-sse",
            client_session_timeout_seconds=60.0,  # wait up to 60 seconds
            params={
                "url": self.url
            },
            cache_tools_list=True
        )
        await self.mcp_server.__aenter__()  # manually enter async context

        self.agent = Agent(
            name=self.agent_name,
            instructions=self.instructions,
            mcp_servers=[self.mcp_server],
            output_type=List[Content]
        )

    async def run(self, input_text: str):
        """Run the agent with the given input text."""
        if self.mcp_server is None or self.agent is None:
            await self._setup()

        result = await Runner.run(starting_agent=self.agent, input=input_text)
        return result.final_output

    async def close(self):
        """Clean up MCP server properly."""
        if self.mcp_server:
            await self.mcp_server.__aexit__(None, None, None)
            self.mcp_server = None
            self.agent = None


# Example usage
if __name__ == "__main__":
    async def main():
        session = MCPAgentRunner()
        start_time = asyncio.get_event_loop().time()
        response = await session.run("İSTANBUL ANKARA 10 KASIM UÇAK BİLETİ")
        end_time = asyncio.get_event_loop().time()
        print(f"Response time: {end_time - start_time} seconds")
        print("Final output:", response)
        await session.close()

    asyncio.run(main())
