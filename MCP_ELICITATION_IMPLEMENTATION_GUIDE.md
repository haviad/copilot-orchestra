# MCP Elicitation Implementation Guide for Copilot Orchestra

## Overview

This document provides a detailed step-by-step guide for implementing MCP (Model Context Protocol) elicitation in the Copilot Orchestra Conductor agent to enable inline user input during mandatory pause points.

**Issue Reference**: [copilot-orchestra#3](https://github.com/ShepAlderson/copilot-orchestra/issues/3)

**MCP Specification**: [Model Context Protocol - Elicitation](https://modelcontextprotocol.io/specification/draft/client/elicitation)

---

## Problem Statement

Currently, the Copilot Orchestra Conductor agent has mandatory pause points (e.g., plan approval, phase completion) that halt execution. Users must:
1. Review the output
2. Start a **new separate chat session** to provide approval/feedback
3. Continue the workflow

This results in:
- **Disrupted workflow** - Multiple separate chat sessions
- **Increased costs** - Each new session counts as a separate premium model request
- **Poor UX** - Fragmented conversation history

---

## Solution: MCP Elicitation

MCP elicitation allows servers to request user input **inline within the same conversation**, maintaining continuity and reducing costs.

### Two Modes Available:

1. **Form Mode** - Structured data collection with JSON schema validation (best for plan approval)
2. **URL Mode** - Out-of-band interactions for sensitive data (not needed for this use case)

---

## Implementation Plan

### Phase 1: Understand MCP Integration Points

#### 1.1 Identify Where MCP Tools Are Defined

The Copilot Orchestra conductor mode is defined as a `.agent.md` file (likely `Conductor.agent.md` or similar in the VS Code settings).

**Action Items:**
- Locate the conductor agent definition file in VS Code settings
- Common locations:
  - `~/.vscode/extensions/` (for extension-based agents)
  - VS Code User Settings → `copilot.orchestration` or similar
  - Workspace `.vscode/` folder

#### 1.2 Understand Current Pause Points

Current pause points in the conductor workflow:
1. **After Planning** - User must approve the plan before implementation
2. **After Each Phase** - User must review and commit before next phase
3. **Plan Completion** - Final summary

---

### Phase 2: Design MCP Tools for Elicitation

#### 2.1 Define MCP Tool: `request_plan_approval`

This tool will be invoked when the conductor needs plan approval.

**Tool Definition (JSON Schema):**

```json
{
  "name": "request_plan_approval",
  "description": "Request user approval for the implementation plan with optional feedback",
  "inputSchema": {
    "type": "object",
    "properties": {
      "planSummary": {
        "type": "string",
        "description": "Brief summary of the plan to present to the user"
      },
      "phaseCount": {
        "type": "integer",
        "description": "Total number of phases in the plan"
      }
    },
    "required": ["planSummary", "phaseCount"]
  }
}
```

**Elicitation Schema for User Response:**

```json
{
  "mode": "form",
  "message": "The implementation plan is ready. Please review and provide your decision.",
  "requestedSchema": {
    "type": "object",
    "properties": {
      "decision": {
        "type": "string",
        "title": "Plan Approval Decision",
        "description": "Do you approve this plan?",
        "oneOf": [
          { "const": "approve", "title": "✅ Approve - Start Implementation" },
          { "const": "request_changes", "title": "📝 Request Changes" },
          { "const": "cancel", "title": "❌ Cancel Task" }
        ]
      },
      "feedback": {
        "type": "string",
        "title": "Feedback (Optional)",
        "description": "Provide feedback or requested changes",
        "minLength": 0,
        "maxLength": 1000
      }
    },
    "required": ["decision"]
  }
}
```

#### 2.2 Define MCP Tool: `request_phase_commit_approval`

This tool will be invoked after each phase completion for commit approval.

**Tool Definition:**

```json
{
  "name": "request_phase_commit_approval",
  "description": "Request user approval to commit phase changes and proceed to next phase",
  "inputSchema": {
    "type": "object",
    "properties": {
      "phaseNumber": {
        "type": "integer",
        "description": "The phase number that was just completed"
      },
      "phaseSummary": {
        "type": "string",
        "description": "Summary of what was accomplished in this phase"
      },
      "filesModified": {
        "type": "array",
        "items": { "type": "string" },
        "description": "List of files created or modified"
      },
      "commitMessage": {
        "type": "string",
        "description": "Proposed git commit message"
      }
    },
    "required": ["phaseNumber", "phaseSummary", "commitMessage"]
  }
}
```

**Elicitation Schema for User Response:**

```json
{
  "mode": "form",
  "message": "Phase {phaseNumber} is complete and ready to commit. Please review and decide how to proceed.",
  "requestedSchema": {
    "type": "object",
    "properties": {
      "decision": {
        "type": "string",
        "title": "Phase Commit Decision",
        "description": "How would you like to proceed?",
        "oneOf": [
          { "const": "commit_and_continue", "title": "✅ Commit & Continue to Next Phase" },
          { "const": "commit_and_pause", "title": "💾 Commit & Pause (Don't start next phase)" },
          { "const": "revise", "title": "🔄 Request Revisions" },
          { "const": "abort", "title": "❌ Abort Plan" }
        ]
      },
      "commitConfirmed": {
        "type": "boolean",
        "title": "I have committed these changes",
        "description": "Confirm you have run 'git commit' with the provided message",
        "default": false
      },
      "revisionNotes": {
        "type": "string",
        "title": "Revision Notes (if requesting revisions)",
        "description": "Describe what needs to be revised",
        "minLength": 0,
        "maxLength": 1000
      }
    },
    "required": ["decision"]
  }
}
```

---

### Phase 3: Create MCP Server Implementation

MCP servers can be implemented in various ways. For Copilot Orchestra, the most practical approach is to create a **Node.js-based MCP server** that integrates with VS Code.

#### 3.1 Project Structure

```
copilot-orchestra-mcp/
├── package.json
├── README.md
├── src/
│   ├── index.js                 # MCP server entry point
│   ├── tools/
│   │   ├── planApproval.js      # Plan approval tool handler
│   │   └── phaseCommit.js       # Phase commit tool handler
│   └── elicitation/
│       ├── schemas.js           # Elicitation schemas
│       └── handlers.js          # Response handlers
└── .mcp/
    └── config.json              # MCP server configuration
```

#### 3.2 MCP Server Implementation

**File: `package.json`**

```json
{
  "name": "@copilot-orchestra/mcp-server",
  "version": "1.0.0",
  "description": "MCP server for Copilot Orchestra inline user elicitation",
  "main": "src/index.js",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0"
  },
  "keywords": ["mcp", "copilot", "orchestra"],
  "license": "MIT"
}
```

**File: `src/index.js`**

```javascript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { planApprovalTool, handlePlanApprovalElicitation } from './tools/planApproval.js';
import { phaseCommitTool, handlePhaseCommitElicitation } from './tools/phaseCommit.js';

// Create MCP server instance
const server = new Server(
  {
    name: 'copilot-orchestra-elicitation',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      // Declare elicitation support
      elicitation: {
        form: {}, // Support form mode elicitation
      },
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [planApprovalTool, phaseCommitTool],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'request_plan_approval':
        return await handlePlanApprovalElicitation(server, args);
      
      case 'request_phase_commit_approval':
        return await handlePhaseCommitElicitation(server, args);
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
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
```

**File: `src/tools/planApproval.js`**

```javascript
import { getPlanApprovalSchema } from '../elicitation/schemas.js';

export const planApprovalTool = {
  name: 'request_plan_approval',
  description: 'Request user approval for the implementation plan with optional feedback',
  inputSchema: {
    type: 'object',
    properties: {
      planSummary: {
        type: 'string',
        description: 'Brief summary of the plan to present to the user',
      },
      phaseCount: {
        type: 'integer',
        description: 'Total number of phases in the plan',
      },
      openQuestions: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of open questions for the user',
      },
    },
    required: ['planSummary', 'phaseCount'],
  },
};

export async function handlePlanApprovalElicitation(server, args) {
  const { planSummary, phaseCount, openQuestions = [] } = args;

  // Build the elicitation message
  let message = `📋 Implementation Plan Ready\n\n${planSummary}\n\nPhases: ${phaseCount}`;
  
  if (openQuestions.length > 0) {
    message += `\n\nOpen Questions:\n${openQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
  }

  // Request user input via elicitation
  const elicitationResponse = await server.request({
    method: 'elicitation/create',
    params: {
      mode: 'form',
      message: message,
      requestedSchema: getPlanApprovalSchema(),
    },
  });

  // Handle the user's response
  const { action, content } = elicitationResponse;

  if (action === 'accept') {
    const { decision, feedback } = content;

    if (decision === 'approve') {
      return {
        content: [
          {
            type: 'text',
            text: `✅ Plan approved by user. ${feedback ? `Feedback: ${feedback}` : 'Proceeding with implementation.'}`,
          },
        ],
      };
    } else if (decision === 'request_changes') {
      return {
        content: [
          {
            type: 'text',
            text: `📝 User requested changes: ${feedback || 'No specific feedback provided'}`,
          },
        ],
      };
    } else if (decision === 'cancel') {
      return {
        content: [
          {
            type: 'text',
            text: `❌ User cancelled the task. ${feedback || ''}`,
          },
        ],
      };
    }
  } else if (action === 'decline') {
    return {
      content: [
        {
          type: 'text',
          text: '❌ User declined plan approval.',
        },
      ],
    };
  } else if (action === 'cancel') {
    return {
      content: [
        {
          type: 'text',
          text: '⏸️ User dismissed the approval dialog.',
        },
      ],
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: 'Unknown response action from elicitation.',
      },
    ],
  };
}
```

**File: `src/tools/phaseCommit.js`**

```javascript
import { getPhaseCommitSchema } from '../elicitation/schemas.js';

export const phaseCommitTool = {
  name: 'request_phase_commit_approval',
  description: 'Request user approval to commit phase changes and proceed to next phase',
  inputSchema: {
    type: 'object',
    properties: {
      phaseNumber: {
        type: 'integer',
        description: 'The phase number that was just completed',
      },
      phaseSummary: {
        type: 'string',
        description: 'Summary of what was accomplished in this phase',
      },
      filesModified: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of files created or modified',
      },
      commitMessage: {
        type: 'string',
        description: 'Proposed git commit message',
      },
    },
    required: ['phaseNumber', 'phaseSummary', 'commitMessage'],
  },
};

export async function handlePhaseCommitElicitation(server, args) {
  const { phaseNumber, phaseSummary, filesModified = [], commitMessage } = args;

  // Build the elicitation message
  const message = `✅ Phase ${phaseNumber} Complete\n\n${phaseSummary}\n\nFiles Modified:\n${filesModified.map(f => `  - ${f}`).join('\n')}\n\nProposed Commit:\n${commitMessage}`;

  // Request user input via elicitation
  const elicitationResponse = await server.request({
    method: 'elicitation/create',
    params: {
      mode: 'form',
      message: message,
      requestedSchema: getPhaseCommitSchema(),
    },
  });

  // Handle the user's response
  const { action, content } = elicitationResponse;

  if (action === 'accept') {
    const { decision, commitConfirmed, revisionNotes } = content;

    switch (decision) {
      case 'commit_and_continue':
        if (!commitConfirmed) {
          return {
            content: [
              {
                type: 'text',
                text: '⚠️ Please commit the changes before continuing. Run: git commit',
              },
            ],
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: '✅ User confirmed commit. Proceeding to next phase.',
            },
          ],
        };

      case 'commit_and_pause':
        if (!commitConfirmed) {
          return {
            content: [
              {
                type: 'text',
                text: '⚠️ Please commit the changes. Run: git commit',
              },
            ],
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: '💾 User confirmed commit. Pausing before next phase.',
            },
          ],
        };

      case 'revise':
        return {
          content: [
            {
              type: 'text',
              text: `🔄 User requested revisions: ${revisionNotes || 'No specific notes provided'}`,
            },
          ],
        };

      case 'abort':
        return {
          content: [
            {
              type: 'text',
              text: '❌ User aborted the plan.',
            },
          ],
        };
    }
  } else if (action === 'decline') {
    return {
      content: [
        {
          type: 'text',
          text: '❌ User declined to proceed with phase commit.',
        },
      ],
    };
  } else if (action === 'cancel') {
    return {
      content: [
        {
          type: 'text',
          text: '⏸️ User dismissed the commit dialog.',
        },
      ],
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: 'Unknown response action from elicitation.',
      },
    ],
  };
}
```

**File: `src/elicitation/schemas.js`**

```javascript
export function getPlanApprovalSchema() {
  return {
    type: 'object',
    properties: {
      decision: {
        type: 'string',
        title: 'Plan Approval Decision',
        description: 'Do you approve this plan?',
        oneOf: [
          { const: 'approve', title: '✅ Approve - Start Implementation' },
          { const: 'request_changes', title: '📝 Request Changes' },
          { const: 'cancel', title: '❌ Cancel Task' },
        ],
      },
      feedback: {
        type: 'string',
        title: 'Feedback (Optional)',
        description: 'Provide feedback or requested changes',
        minLength: 0,
        maxLength: 1000,
        default: '',
      },
    },
    required: ['decision'],
  };
}

export function getPhaseCommitSchema() {
  return {
    type: 'object',
    properties: {
      decision: {
        type: 'string',
        title: 'Phase Commit Decision',
        description: 'How would you like to proceed?',
        oneOf: [
          { const: 'commit_and_continue', title: '✅ Commit & Continue to Next Phase' },
          { const: 'commit_and_pause', title: '💾 Commit & Pause (Don\'t start next phase)' },
          { const: 'revise', title: '🔄 Request Revisions' },
          { const: 'abort', title: '❌ Abort Plan' },
        ],
      },
      commitConfirmed: {
        type: 'boolean',
        title: 'I have committed these changes',
        description: 'Confirm you have run \'git commit\' with the provided message',
        default: false,
      },
      revisionNotes: {
        type: 'string',
        title: 'Revision Notes (if requesting revisions)',
        description: 'Describe what needs to be revised',
        minLength: 0,
        maxLength: 1000,
        default: '',
      },
    },
    required: ['decision'],
  };
}
```

---

### Phase 4: Configure MCP Server in VS Code

#### 4.1 Create MCP Configuration

Create a configuration file to register the MCP server with VS Code.

**File: `.mcp/config.json` (in workspace or VS Code settings)**

```json
{
  "mcpServers": {
    "copilot-orchestra": {
      "command": "node",
      "args": ["path/to/copilot-orchestra-mcp/src/index.js"],
      "env": {},
      "disabled": false
    }
  }
}
```

#### 4.2 Register with VS Code Settings

Add to VS Code `settings.json`:

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

---

### Phase 5: Update Conductor Agent to Use MCP Tools

#### 5.1 Modify Conductor Agent Instructions

Update the `Conductor.agent.md` (or wherever the conductor mode is defined) to use the MCP tools instead of hard stops.

**Before (current approach):**

```markdown
4. **Present Plan to User**: Share the plan synopsis in chat, highlighting any open questions or implementation options.

5. **Pause for User Approval**: MANDATORY STOP. Wait for user to approve the plan or request changes.
```

**After (with MCP elicitation):**

```markdown
4. **Present Plan to User**: Share the plan synopsis in chat, highlighting any open questions or implementation options.

5. **Request Plan Approval via MCP**: Use the `request_plan_approval` MCP tool to present the plan and collect user decision inline:
   ```
   Tool: request_plan_approval
   Arguments:
   - planSummary: {Brief TL;DR of the plan}
   - phaseCount: {Number of phases}
   - openQuestions: [{list of questions}]
   ```
   
   Based on the user's response:
   - **approve**: Write plan file and proceed to Phase 2
   - **request_changes**: Gather additional context and revise the plan (return to step 2)
   - **cancel**: End the task and inform the user
```

#### 5.2 Update Phase Completion Flow

**Before:**

```markdown
3. **MANDATORY STOP**: Wait for user to:
   - Make the git commit
   - Confirm readiness to proceed to next phase
   - Request changes or abort
```

**After:**

```markdown
3. **Request Phase Commit Approval via MCP**: Use the `request_phase_commit_approval` MCP tool:
   ```
   Tool: request_phase_commit_approval
   Arguments:
   - phaseNumber: {N}
   - phaseSummary: {What was accomplished}
   - filesModified: [{list of files}]
   - commitMessage: {Generated commit message}
   ```
   
   Based on the user's response:
   - **commit_and_continue**: Verify commit confirmation, proceed to next phase
   - **commit_and_pause**: Verify commit confirmation, wait for user to resume
   - **revise**: Return to implementation with revision notes
   - **abort**: End the plan and create completion report
```

---

### Phase 6: Testing the Implementation

#### 6.1 Manual Testing

1. **Start MCP Server:**
   ```bash
   cd copilot-orchestra-mcp
   npm install
   npm start
   ```

2. **Open VS Code with MCP enabled**

3. **Trigger Conductor Agent:**
   ```
   @workspace /conductor Implement a new feature...
   ```

4. **Verify Elicitation Works:**
   - At plan approval, you should see an inline form appear
   - Select an option and provide feedback
   - Confirm the conductor proceeds based on your input

#### 6.2 Test Cases

| Test Case | Expected Behavior |
|-----------|-------------------|
| Plan approval - Approve | Conductor writes plan and starts implementation |
| Plan approval - Request changes | Conductor revises plan with feedback |
| Plan approval - Cancel | Conductor ends task gracefully |
| Phase commit - Commit & Continue | Conductor proceeds to next phase |
| Phase commit - Commit & Pause | Conductor pauses and waits |
| Phase commit - Revise | Conductor re-implements phase with notes |
| User dismisses dialog (cancel) | Conductor pauses and explains next steps |

---

### Phase 7: Error Handling and Edge Cases

#### 7.1 Handle MCP Not Available

If the MCP server isn't running or elicitation isn't supported:

```markdown
If `request_plan_approval` tool is not available:
- Fall back to current behavior (hard stop)
- Inform user: "⚠️ MCP elicitation not available. Please review the plan above and respond with 'approve', 'request changes', or 'cancel'."
```

#### 7.2 Handle Malformed Responses

```javascript
// In tool handlers
if (!content || !content.decision) {
  return {
    content: [
      {
        type: 'text',
        text: '⚠️ Invalid response received. Please try again.',
      },
    ],
    isError: true,
  };
}
```

#### 7.3 Handle Timeout Scenarios

```javascript
// Add timeout wrapper
async function withTimeout(promise, timeoutMs = 300000) { // 5 min default
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Elicitation timeout')), timeoutMs)
    ),
  ]);
}
```

---

## Benefits of This Implementation

### 1. **Continuous Workflow**
- Single conversation session from start to finish
- No context loss between steps
- Natural, flowing interaction

### 2. **Cost Reduction**
- Eliminates extra chat sessions
- Single premium model invocation covers entire workflow
- Estimated **50-70% cost reduction** for complex tasks

### 3. **Better UX**
- Inline decision points feel natural
- Clear options presented via form UI
- Immediate feedback and continuation

### 4. **Flexibility**
- User can still pause and resume
- Explicit approval at critical points
- Revision requests handled gracefully

---

## Migration Path

### Option 1: Parallel Support
- Keep existing hard stops as fallback
- Add MCP elicitation as enhanced mode
- Auto-detect MCP availability and use accordingly

### Option 2: Gradual Rollout
- Phase 1: Plan approval only
- Phase 2: Add phase commit approval
- Phase 3: Deprecate hard stops

### Option 3: Full Migration
- Require MCP elicitation
- Update documentation
- Provide setup instructions for users

---

## Additional Considerations

### Security
- Elicitation responses are part of conversation context
- No sensitive data should be requested via form mode
- Use URL mode for OAuth or credentials (if needed in future)

### Logging and Debugging
- Log all elicitation requests/responses
- Include user decisions in plan completion files
- Help troubleshoot workflow issues

### Documentation
- Update README with MCP setup instructions
- Add troubleshooting guide
- Provide example workflows

---

## References

1. [MCP Specification - Elicitation](https://modelcontextprotocol.io/specification/draft/client/elicitation)
2. [MCP SDK for Node.js](https://github.com/modelcontextprotocol/typescript-sdk)
3. [GitHub Issue #3](https://github.com/ShepAlderson/copilot-orchestra/issues/3)
4. [VS Code MCP Integration](https://code.visualstudio.com/docs/copilot/model-context-protocol)

---

## Next Steps

1. Set up the MCP server project structure
2. Implement the two core tools (plan approval, phase commit)
3. Configure VS Code to use the MCP server
4. Update conductor agent instructions
5. Test with a simple implementation task
6. Gather user feedback and iterate
7. Document and roll out to the community

---

## Conclusion

Implementing MCP elicitation in Copilot Orchestra transforms the workflow from a fragmented multi-request process into a seamless, continuous interaction. This enhancement significantly improves both user experience and cost efficiency while maintaining the safety and control of explicit approval points.

The key is treating elicitation not as a replacement for human oversight, but as a **better interface** for collecting that oversight inline within the natural flow of the conversation.
