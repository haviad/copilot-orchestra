import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Create MCP server instance
const server = new Server(
  {
    name: 'copilot-orchestra-elicitation',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      elicitation: {
        form: {},
      },
    },
  }
);

// List available tools (empty for now, will be populated in Phase 2 & 3)
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [],
  };
});

// Handle tool execution (will be implemented in Phase 2 & 3)
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;
  
  throw new Error(`Unknown tool: ${name}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Copilot Orchestra MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});

export { server };
