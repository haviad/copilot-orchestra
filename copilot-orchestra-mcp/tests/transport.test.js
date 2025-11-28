import { describe, it, expect } from 'vitest';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

describe('Stdio Transport', () => {
  it('should create stdio transport instance', () => {
    const transport = new StdioServerTransport();
    expect(transport).toBeDefined();
  });

  it('should have start method', () => {
    const transport = new StdioServerTransport();
    expect(typeof transport.start).toBe('function');
  });

  it('should have close method', () => {
    const transport = new StdioServerTransport();
    expect(typeof transport.close).toBe('function');
  });
});
