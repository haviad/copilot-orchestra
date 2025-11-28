import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

describe('MCP Server Initialization', () => {
  let server;

  beforeEach(() => {
    server = new Server(
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
  });

  afterEach(() => {
    server = null;
  });

  it('should create server instance', () => {
    expect(server).toBeDefined();
    expect(typeof server.setRequestHandler).toBe('function');
  });

  it('should allow setting request handlers', () => {
    let handlerCalled = false;
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      handlerCalled = true;
      return { tools: [] };
    });
    expect(handlerCalled).toBe(false); // Handler not called yet
  });

  it('should have connect method for transport', () => {
    expect(typeof server.connect).toBe('function');
  });

  it('should have close method', () => {
    expect(typeof server.close).toBe('function');
  });
});
