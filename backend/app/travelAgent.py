import asyncio
from typing import List, Optional
from agents import Agent, Runner
from agents.mcp import MCPServerStdio
from models.Message import Content
import os
from dotenv import load_dotenv
load_dotenv(override=True)

OPENAI_API_KEY=os.getenv("OPENAI_API_KEY")
class MCPAgentRunner:
    def __init__(self, 
                 name: str = "AssistantWithMCP",
                 instructions: str = "You can use the tools exposed by the enuygun MCP server.",
                 command: str = "npx",
                 args: Optional[list] = None):
        if args is None:
            args = ["-y", "mcp-remote", "https://mcp.enuygun.com/mcp"]

        self.command = command
        self.args = args
        self.agent_name = name
        self.instructions = instructions
        self.mcp_server: Optional[MCPServerStdio] = None
        self.agent: Optional[Agent] = None

    async def _setup(self):
        """Initialize MCP server and agent."""
        self.mcp_server = MCPServerStdio(
            name="enuygun-mcp",
            params={"command": self.command, "args": self.args}
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
        response = await session.run("İSTANBUL ANKARA 10 KASIM UÇAK BİLETİ ")
        print("Final output:", response)
        await session.close()

    asyncio.run(main())

