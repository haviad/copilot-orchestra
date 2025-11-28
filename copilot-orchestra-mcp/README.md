# Copilot Orchestra MCP Server

MCP (Model Context Protocol) server for Copilot Orchestra that enables inline user elicitation during pause points.

## Overview

This MCP server provides two elicitation tools that transform the Copilot Orchestra workflow from fragmented multi-session interactions into a seamless, continuous conversation:

- **`request_plan_approval`** - Inline approval for implementation plans
- **`request_phase_commit_approval`** - Inline approval for phase commits

## Prerequisites

- **Node.js** 18.0.0 or higher
- **VS Code Insiders** 1.101 or higher
- **GitHub Copilot** subscription with Chat extension

## Installation

### 1. Install Dependencies

```bash
cd copilot-orchestra-mcp
npm install
```

### 2. Test the Server

```bash
npm test
```

### 3. Start the Server (for testing)

```bash
npm start
```

The server runs on stdio and will output: `Copilot Orchestra MCP server running on stdio`

## VS Code Configuration

To use this MCP server with VS Code and the Conductor agent, add to your workspace `.vscode/settings.json`:

```json
{
  "github.copilot.advanced": {
    "mcp": {
      "enabled": true,
      "servers": [
        {
          "name": "copilot-orchestra",
          "command": "node",
          "args": ["${workspaceFolder}/copilot-orchestra-mcp/src/index.js"]
        }
      ]
    }
  }
}
```

## Using in Other Projects

To use this MCP server in another project that uses Copilot Orchestra:

### Method 1: Copy to New Project

1. **Copy the Directory:**
   ```bash
   cp -r copilot-orchestra-mcp /path/to/your/project/
   cd /path/to/your/project/copilot-orchestra-mcp
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Test the Server:**
   ```bash
   npm test
   ```

4. **Configure VS Code:**
   Create or update `.vscode/settings.json` in your project root:
   ```json
   {
     "github.copilot.chat.mcp.enabled": true,
     "github.copilot.chat.mcp.servers": {
       "copilot-orchestra-elicitation": {
         "command": "node",
         "args": ["copilot-orchestra-mcp/src/index.js"]
       }
     }
   }
   ```

5. **Restart VS Code:**
   Reload the window (`Developer: Reload Window`) for the MCP server to be detected.

### Method 2: Shared Installation

If you want to use one MCP server installation across multiple projects:

1. **Install in a Central Location:**
   ```bash
   # Example: Install in home directory
   cd ~
   git clone <repo-url> copilot-orchestra-shared
   cd copilot-orchestra-shared/copilot-orchestra-mcp
   npm install
   ```

2. **Configure Each Project:**
   In each project's `.vscode/settings.json`, use absolute path:
   ```json
   {
     "github.copilot.chat.mcp.enabled": true,
     "github.copilot.chat.mcp.servers": {
       "copilot-orchestra-elicitation": {
         "command": "node",
         "args": ["/Users/username/copilot-orchestra-shared/copilot-orchestra-mcp/src/index.js"]
       }
     }
   }
   ```

3. **Alternatively, Use Workspace Variable:**
   Create a symlink in each project:
   ```bash
   cd /path/to/your/project
   ln -s ~/copilot-orchestra-shared/copilot-orchestra-mcp ./copilot-orchestra-mcp
   ```
   
   Then use relative path in settings as shown in Method 1.

### Using with Custom Conductor Agents

If you've customized the Conductor agent for your project:

1. Ensure the Conductor invokes `#request_plan_approval` and `#request_phase_commit_approval` tools
2. Add fallback logic for when MCP tools are unavailable
3. See the main repository's `Conductor.agent.md` for reference implementation

### Verifying Installation

After setup, verify the MCP server works:

1. Open VS Code in your project
2. Check Output panel (View → Output → "GitHub Copilot Chat MCP")
3. Look for: `Copilot Orchestra MCP server running on stdio`
4. Start a Conductor workflow and check for inline approval forms

## Development

### Running Tests

```bash
npm test              # Run tests once
npm run test:watch    # Watch mode
```

### Project Structure

```
copilot-orchestra-mcp/
├── package.json           # Project manifest
├── README.md             # This file
├── src/
│   ├── index.js          # MCP server entry point
│   ├── tools/            # Tool implementations (Phase 2 & 3)
│   └── elicitation/      # Elicitation schemas (Phase 2 & 3)
└── tests/
    ├── server.test.js    # Server initialization tests
    └── transport.test.js # Transport tests
```

## Troubleshooting

### Server Not Starting

- Verify Node.js version: `node --version` (should be 18+)
- Check for syntax errors: `node --check src/index.js`
- Review VS Code Output panel for errors

### Tools Not Appearing in Conductor

- Ensure MCP server is configured in `.vscode/settings.json`
- Reload VS Code window after configuration changes
- Check that the file path in settings is correct
- Verify server is running (check VS Code Output → MCP Logs)

### Fallback to Manual Approval

If MCP tools are not available, the Conductor agent will automatically fall back to the manual "MANDATORY STOP" approval mode. This ensures backward compatibility.

## License

MIT
