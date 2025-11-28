## Plan: MCP Elicitation Implementation for Copilot Orchestra

Implement the Model Context Protocol (MCP) elicitation system to enable inline user approvals during pause points, transforming the workflow from fragmented multi-session interactions into a seamless, continuous conversation. This includes creating a Node.js MCP server with two elicitation tools, integrating them into the Conductor agent, and updating documentation for reusability in other projects.

**Phases: 5**

### 1. **Phase 1: MCP Server Foundation**
   - **Objective:** Create the Node.js MCP server project structure with core dependencies and entry point
   - **Files/Functions to Modify/Create:** 
     - `copilot-orchestra-mcp/package.json` (new)
     - `copilot-orchestra-mcp/src/index.js` (new)
     - `copilot-orchestra-mcp/README.md` (new)
   - **Tests to Write:** 
     - `copilot-orchestra-mcp/tests/server.test.js` - Test server initialization and tool registration
     - `copilot-orchestra-mcp/tests/transport.test.js` - Test stdio transport setup
   - **Steps:**
     1. Create directory structure `copilot-orchestra-mcp/src/`, `copilot-orchestra-mcp/tests/`
     2. Write test for server initialization checking MCP server starts and registers tools
     3. Run test to see it fail (no implementation yet)
     4. Create `package.json` with `@modelcontextprotocol/sdk` dependency and test framework
     5. Implement `src/index.js` with Server instance, ListToolsRequestSchema handler, and stdio transport
     6. Run test to verify server starts successfully
     7. Create basic MCP server README with setup instructions

### 2. **Phase 2: Plan Approval Tool Implementation**
   - **Objective:** Implement the `request_plan_approval` MCP tool with elicitation schema for plan approval workflow
   - **Files/Functions to Modify/Create:**
     - `copilot-orchestra-mcp/src/tools/planApproval.js` (new)
     - `copilot-orchestra-mcp/src/elicitation/schemas.js` (new)
     - Update `copilot-orchestra-mcp/src/index.js` to import and handle plan approval tool
   - **Tests to Write:**
     - `copilot-orchestra-mcp/tests/planApproval.test.js` - Test plan approval tool handler with various user responses
     - `copilot-orchestra-mcp/tests/schemas.test.js` - Validate JSON schema structure for plan approval
   - **Steps:**
     1. Write tests for plan approval tool handling approve/request_changes/cancel decisions
     2. Run tests to see them fail
     3. Implement `getPlanApprovalSchema()` in `src/elicitation/schemas.js` with JSON schema for form
     4. Implement `planApprovalTool` definition and `handlePlanApprovalElicitation()` in `src/tools/planApproval.js`
     5. Update `src/index.js` CallToolRequestSchema handler to route to plan approval
     6. Run tests to verify plan approval tool works correctly
     7. Format code and verify linting passes

### 3. **Phase 3: Phase Commit Tool Implementation**
   - **Objective:** Implement the `request_phase_commit_approval` MCP tool for phase completion workflow
   - **Files/Functions to Modify/Create:**
     - `copilot-orchestra-mcp/src/tools/phaseCommit.js` (new)
     - Update `copilot-orchestra-mcp/src/elicitation/schemas.js` to add phase commit schema
     - Update `copilot-orchestra-mcp/src/index.js` to handle phase commit tool
   - **Tests to Write:**
     - `copilot-orchestra-mcp/tests/phaseCommit.test.js` - Test phase commit tool with commit_and_continue/commit_and_pause/revise/abort
   - **Steps:**
     1. Write tests for phase commit tool handling all four decision types and commit confirmation
     2. Run tests to see them fail
     3. Implement `getPhaseCommitSchema()` in `src/elicitation/schemas.js`
     4. Implement `phaseCommitTool` definition and `handlePhaseCommitElicitation()` in `src/tools/phaseCommit.js`
     5. Update `src/index.js` CallToolRequestSchema handler to route to phase commit
     6. Run tests to verify phase commit tool works correctly
     7. Format code and verify linting passes

### 4. **Phase 4: Conductor Agent Integration**
   - **Objective:** Update the Conductor agent to use MCP elicitation tools with fallback to manual approval
   - **Files/Functions to Modify/Create:**
     - `Conductor.agent.md` (modify workflow sections)
     - `.vscode/settings.json` (new) - VS Code configuration for MCP server
   - **Tests to Write:**
     - Manual testing workflow (no automated tests for agent files, but document test cases in phase completion)
   - **Steps:**
     1. Review current pause point implementation in `Conductor.agent.md` lines 19 and 60
     2. Draft updated workflow instructions replacing MANDATORY STOP with MCP tool usage
     3. Add fallback logic for when MCP tools are unavailable
     4. Update Planning Phase (step 5) to use `#request_plan_approval` tool with decision handling
     5. Update Implementation Cycle (step 2C) to use `#request_phase_commit_approval` tool with response handling
     6. Create `.vscode/settings.json` with MCP server configuration
     7. Manually test complete workflow: Planning → Implementation → Review → Commit cycle

### 5. **Phase 5: Documentation and Reusability**
   - **Objective:** Update README.md with comprehensive MCP setup guide and usage instructions for other projects
   - **Files/Functions to Modify/Create:**
     - `README.md` (update with MCP sections)
     - `MCP_SETUP_GUIDE.md` (new) - Detailed setup instructions
     - Update `copilot-orchestra-mcp/README.md` with usage for external projects
   - **Tests to Write:**
     - No automated tests, but create verification checklist for documentation completeness
   - **Steps:**
     1. Add new section in README.md after "Key Features": "MCP Elicitation (Enhanced Workflow)"
     2. Update "Installation" section with "MCP Server Setup (Optional)" subsection
     3. Add "Using MCP Elicitation" section with inline approval examples
     4. Update "Architecture Overview" to mention optional MCP server component
     5. Create `MCP_SETUP_GUIDE.md` with detailed configuration, troubleshooting, and VS Code setup
     6. Update `copilot-orchestra-mcp/README.md` with instructions for using in other projects
     7. Add "Troubleshooting" section to main README covering common MCP issues

**Resolved Questions:**

1. **MCP Server Distribution:** Keep as local installation first (can add npm publishing later if demand)
2. **Configuration Location:** Document both workspace and user settings, recommend workspace `.vscode/settings.json` for team sharing
3. **VS Code Version Requirements:** Minimum VS Code Insiders 1.101 required for MCP client support
4. **Fallback UX:** Show clear explanatory message when falling back to manual mode, ensure Conductor and subagents continue working normally
5. **Testing Strategy:** Use unit tests with Jest/Vitest + manual integration testing (add MCP SDK integration tests later if needed)
