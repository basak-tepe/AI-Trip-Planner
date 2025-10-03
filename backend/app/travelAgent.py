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
                 args: Optional[list] = None,
                 ):
        if args is None:
            args = ["-y", "mcp-remote", "https://mcp.enuygun.com/mcp"]

        self.command = command
        self.args = args
        self.agent_name = name
        self.instructions = instructions
        self.mcp_server: Optional[MCPServerStdio] = None
        self.agent: Optional[Agent] = None
        self.conversation_history: List[dict] = []

    async def _setup(self):
        """Initialize MCP server and agent."""
        self.mcp_server = MCPServerStdio(
            name="enuygun-mcp",
            params={"command": self.command, "args": self.args},
            client_session_timeout_seconds=60.0,  # wait up to 60 seconds
            cache_tools_list=True,                 # optional, avoids round trips
            max_retry_attempts=2,                  # optional, adds retries
            retry_backoff_seconds_base=2.0        # optional, adds exponential backoff on retries
        )
        await self.mcp_server.__aenter__()  # manually enter async context

        self.agent = Agent(
            name=self.agent_name,
            instructions=self.instructions,
            mcp_servers=[self.mcp_server],
            output_type=List[Content]
        )

    async def run(self, input_text: str, conversation_history: Optional[List[dict]] = None):
        """Run the agent with the given input text and conversation history."""
        if self.mcp_server is None or self.agent is None:
            await self._setup()
        
        # Update conversation history if provided
        if conversation_history is not None:
            self.conversation_history = conversation_history
        
        # Add current user message to history
        self.conversation_history.append({"role": "user", "content": input_text})
        
        try:
            # Create context from conversation history
            context = self._build_context_from_history()
            result = await Runner.run(starting_agent=self.agent, input=context)
            
            # Add assistant response to history
            assistant_content = result.final_output
            self.conversation_history.append({"role": "assistant", "content": assistant_content})
            
            return result.final_output
        finally:
            await self.close()
    
    def _build_context_from_history(self) -> str:
        """Build context string from conversation history."""
        if not self.conversation_history:
            return ""
        
        context_parts = []
        for message in self.conversation_history:
            role = message["role"]
            content = message["content"]
            if role == "user":
                context_parts.append(f"User: {content}")
            elif role == "assistant":
                context_parts.append(f"Assistant: {content}")
        
        return "\n".join(context_parts)
    
    def get_conversation_history(self) -> List[dict]:
        """Get the current conversation history."""
        return self.conversation_history.copy()
    
    def clear_history(self):
        """Clear the conversation history."""
        self.conversation_history = []

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
        response = await session.run("İSTANBUL ANKARA 10 KASIM UÇAK BİLETİ ")
        end_time = asyncio.get_event_loop().time()
        print(f"Response time: {end_time - start_time} seconds")
        print("Final output:", response)
        await session.close()

    asyncio.run(main())

