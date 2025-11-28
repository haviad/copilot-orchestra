# MCP Server Setup Guide for Copilot Orchestra

This guide provides comprehensive instructions for setting up and using the Model Context Protocol (MCP) server with Copilot Orchestra.

## Overview

The MCP server enhances the Copilot Orchestra workflow by enabling inline user approvals during pause points. Instead of stopping and waiting for manual confirmation, the Conductor agent can present interactive forms for:

- **Plan Approval** - Review and approve/modify implementation plans inline
- **Phase Commit Approval** - Commit phases and control workflow progression seamlessly

## Benefits

### Before MCP (Manual Approval)
1. Conductor presents plan
2. **STOP** - Wait for user response
3. User types approval in chat
4. Conductor continues
5. *Context may be lost between sessions*

### With MCP (Inline Elicitation)
1. Conductor presents plan with interactive form
2. User selects decision and adds comments inline
3. Conductor immediately processes response and continues
4. *Seamless, continuous conversation flow*

## Prerequisites

Before setting up the MCP server, ensure you have:

- **Node.js 18.0.0 or higher**
  ```bash
  node --version  # Should show v18.0.0 or higher
  ```

- **VS Code Insiders 1.101 or higher**
  - Download: https://code.visualstudio.com/insiders/
  - Required for MCP client support

- **GitHub Copilot subscription**
  - Active subscription with Chat extension enabled

## Installation Steps

### 1. Install MCP Server Dependencies

Navigate to the MCP server directory and install dependencies:

```bash
cd copilot-orchestra-mcp
npm install
```

This installs:
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `vitest` - Test framework (dev dependency)

### 2. Verify Installation

Run the test suite to ensure everything is working:

```bash
npm test
```

Expected output:
```
✓ tests/server.test.js (4 tests)
✓ tests/transport.test.js (3 tests)
✓ tests/planApproval.test.js (6 tests)
✓ tests/phaseCommit.test.js (7 tests)
✓ tests/schemas.test.js (3 tests)

Test Files  5 passed (5)
Tests  23 passed (23)
```

### 3. Configure VS Code

The repository includes a `.vscode/settings.json` file with MCP configuration. Verify it contains:

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

**Configuration Options:**

- **Workspace Settings** (Recommended)
  - Location: `.vscode/settings.json` in project root
  - Scoped to current project
  - Can be committed to share with team

- **User Settings**
  - Location: VS Code Settings → Search "mcp"
  - Global across all workspaces
  - Useful if using Orchestra in multiple projects

### 4. Restart VS Code

For the MCP server to be detected:

1. Save all changes
2. Restart VS Code Insiders (`Cmd+Q` on Mac, `Ctrl+Q` on Windows/Linux)
3. Reopen your workspace
4. The MCP server will start automatically when Copilot Chat initializes

### 5. Verify MCP Server is Running

Check the VS Code Output panel:

1. Open Output panel: `View → Output` (or `Cmd+Shift+U`)
2. Select "GitHub Copilot Chat MCP" from dropdown
3. Look for: `Copilot Orchestra MCP server running on stdio`

If you see errors, proceed to the Troubleshooting section below.

## Using the MCP Tools

Once configured, the Conductor agent automatically uses MCP tools at pause points.

### Plan Approval Workflow

When the Conductor presents a plan, you'll see an inline form:

**Form Fields:**
- **Decision** (required): 
  - `approve` - Accept the plan and start implementation
  - `request_changes` - Request modifications to the plan
  - `cancel` - Cancel the entire workflow
- **Comments** (optional): Feedback or change requests
- **Approval Summary** (auto-filled): Brief plan overview

**Example Interaction:**

```
Conductor: Here's the implementation plan for adding user authentication...

[MCP Form Appears]
Decision: [approve / request_changes / cancel]
Comments: [Add any feedback here]
Approval Summary: [Auto-populated plan summary]

You select: request_changes
Comments: "Please add rate limiting to the login endpoint"

Conductor: I'll revise the plan to include rate limiting...
```

### Phase Commit Approval Workflow

After each phase is implemented and reviewed, you'll see:

**Form Fields:**
- **Decision** (required):
  - `commit_and_continue` - Commit phase and proceed to next
  - `commit_and_pause` - Commit but stop for review
  - `revise` - Request changes to current phase
  - `abort` - Stop remaining phases
- **Commit Message** (required for commits): Pre-filled, editable git message
- **Notes** (optional): Additional context or notes

**Example Interaction:**

```
Conductor: Phase 1 complete - User model with password hashing

[MCP Form Appears]
Decision: [commit_and_continue / commit_and_pause / revise / abort]
Commit Message: "feat: Add User model with password hashing"
Notes: [Optional notes]

You select: commit_and_continue

Conductor: Phase 1 committed. Starting Phase 2: Registration endpoint...
```

## Fallback Behavior

The Conductor agent gracefully handles MCP unavailability:

**When MCP Tools Available:**
- Inline forms for approvals
- Seamless conversation flow
- Immediate response processing

**When MCP Tools Unavailable:**
- Automatic fallback to "MANDATORY STOP" mode
- Presents information and waits for manual input
- Full functionality preserved, just less seamless

**Fallback is triggered when:**
- MCP server not configured
- Server fails to start
- Network/connection issues
- VS Code Insiders version too old

## Troubleshooting

### MCP Server Not Starting

**Symptom:** No MCP-related messages in Output panel

**Solutions:**
1. Verify Node.js version:
   ```bash
   node --version  # Must be 18+
   ```

2. Check for syntax errors:
   ```bash
   node --check copilot-orchestra-mcp/src/index.js
   ```

3. Test server manually:
   ```bash
   cd copilot-orchestra-mcp
   npm start
   ```
   Should output: `Copilot Orchestra MCP server running on stdio`

4. Verify dependencies installed:
   ```bash
   cd copilot-orchestra-mcp
   npm install
   ```

### MCP Tools Not Appearing

**Symptom:** Conductor uses "MANDATORY STOP" instead of inline forms

**Solutions:**
1. Check `.vscode/settings.json` exists and is valid JSON
2. Verify file paths in settings are correct:
   ```json
   "args": ["copilot-orchestra-mcp/src/index.js"]
   ```
   Should be relative to workspace root

3. Ensure `github.copilot.chat.mcp.enabled` is `true`

4. Reload VS Code window:
   - `Cmd+Shift+P` → "Developer: Reload Window"

5. Check VS Code Insiders version:
   - `Code → About VS Code Insiders` (Mac)
   - `Help → About` (Windows/Linux)
   - Must be 1.101+

### Server Crashes or Errors

**Symptom:** MCP server starts but crashes during use

**Solutions:**
1. Check Output panel for error messages:
   - `View → Output`
   - Select "GitHub Copilot Chat MCP"

2. Review error logs for specific issues:
   - Invalid tool inputs
   - Schema validation errors
   - Missing required fields

3. Run tests to verify server health:
   ```bash
   cd copilot-orchestra-mcp
   npm test
   ```

4. Clear Node modules and reinstall:
   ```bash
   cd copilot-orchestra-mcp
   rm -rf node_modules package-lock.json
   npm install
   ```

### Configuration Not Working

**Symptom:** Settings seem correct but MCP not activating

**Solutions:**
1. Try User Settings instead of Workspace:
   - `Cmd+,` to open Settings
   - Search for "github copilot mcp"
   - Enable and configure manually

2. Check for conflicting settings:
   - Search for "mcp" in settings
   - Ensure no other MCP servers conflict

3. Verify GitHub Copilot extension is active:
   - Check status bar for Copilot icon
   - Try `Cmd+Shift+P` → "GitHub Copilot: Sign In"

4. Check console for errors:
   - `Help → Toggle Developer Tools`
   - Look for MCP-related errors in Console tab

## Advanced Configuration

### Using in Multiple Projects

To use the MCP server across multiple Copilot Orchestra projects:

1. **Option A: User Settings (Global)**
   - Add MCP configuration to User Settings
   - Use absolute paths or workspace variables
   - Example:
     ```json
     {
       "github.copilot.chat.mcp.enabled": true,
       "github.copilot.chat.mcp.servers": {
         "copilot-orchestra-elicitation": {
           "command": "node",
           "args": ["${workspaceFolder}/copilot-orchestra-mcp/src/index.js"]
         }
       }
     }
     ```

2. **Option B: Shared MCP Server**
   - Install MCP server in a central location
   - Point all projects to same installation
   - Update paths in each project's settings

### Custom Tool Configuration

The MCP server can be extended with additional elicitation tools:

1. Add new tool definitions in `copilot-orchestra-mcp/src/tools/`
2. Register tools in `src/index.js`
3. Update schemas in `src/elicitation/schemas.js`
4. Add tests in `tests/`
5. Update Conductor agent to use new tools

See `copilot-orchestra-mcp/README.md` for development details.

## Testing Your Setup

To verify your MCP setup is working correctly:

1. **Start a Test Workflow:**
   ```
   Open Copilot Chat
   Select "Conductor" mode
   Send: "Create a simple hello world function"
   ```

2. **Check for MCP Form:**
   - After plan presentation, look for interactive form
   - Should see decision dropdown and comment field
   - If you see "MANDATORY STOP", MCP is not active

3. **Complete the Workflow:**
   - Select `approve` and continue
   - Verify phase commit also shows MCP form
   - Both pause points should use inline forms

4. **Test Fallback:**
   - Stop MCP server: edit `.vscode/settings.json` to disable
   - Reload VS Code
   - Verify Conductor falls back to manual approval

## Performance Considerations

The MCP server has minimal performance impact:

- **Startup Time:** < 100ms (Node.js process initialization)
- **Response Time:** < 10ms (form processing)
- **Memory Usage:** ~30MB (Node.js runtime + dependencies)
- **CPU Usage:** Negligible (event-driven, idle when not in use)

The server runs in a separate process and doesn't affect VS Code or Copilot performance.

## Security Notes

- MCP server runs locally on your machine
- Communication via stdio (no network exposure)
- No data sent to external services
- All elicitation handled within VS Code
- Server has no file system access beyond workspace

## Getting Help

If you encounter issues not covered in this guide:

1. **Check Main README:**
   - `README.md` has overview and common issues

2. **Review MCP Server README:**
   - `copilot-orchestra-mcp/README.md` has technical details

3. **Run Diagnostic Tests:**
   ```bash
   cd copilot-orchestra-mcp
   npm test -- --reporter=verbose
   ```

4. **File an Issue:**
   - GitHub repository issues page
   - Include VS Code version, Node version, error logs

## Next Steps

With MCP configured:

1. Try a simple workflow to test inline approvals
2. Experiment with different decision options
3. Provide feedback on comments/notes fields
4. Use `commit_and_continue` for rapid iteration
5. Enjoy seamless, continuous development flow!

---

**Remember:** MCP elicitation is optional. The Conductor works perfectly in manual approval mode if you prefer or if MCP setup isn't feasible for your environment.
