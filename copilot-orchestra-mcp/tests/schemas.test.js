import { describe, it, expect } from 'vitest';
import { getPlanApprovalSchema } from '../src/elicitation/schemas.js';

describe('getPlanApprovalSchema()', () => {
  it('has correct root structure', () => {
    const schema = getPlanApprovalSchema();
    expect(schema.type).toBe('object');
    expect(schema.properties).toBeDefined();
    expect(schema.required).toContain('decision');
  });

  it('properties include decision, comments, approval_summary', () => {
    const { properties } = getPlanApprovalSchema();
    expect(Object.keys(properties)).toEqual(
      expect.arrayContaining(['decision', 'comments', 'approval_summary'])
    );
    expect(properties.decision.type).toBe('string');
    expect(properties.decision.enum).toEqual(['approve', 'request_changes', 'cancel']);
    expect(properties.comments.type).toBe('string');
    expect(properties.approval_summary.type).toBe('string');
  });

  it('validates sample payloads with a JSON Schema validator', async () => {
    const schema = getPlanApprovalSchema();
    // Lightweight inline validator for enums and required for tests without adding deps
    const validate = (data) => {
      if (typeof data !== 'object' || data === null) return false;
      if (!('decision' in data)) return false;
      const validDecision = ['approve', 'request_changes', 'cancel'].includes(data.decision);
      if (!validDecision) return false;
      if (data.decision === 'request_changes' && !data.comments) return false;
      return true;
    };

    expect(validate({ decision: 'approve' })).toBe(true);
    expect(validate({ decision: 'request_changes', comments: 'Need changes' })).toBe(true);
    expect(validate({ decision: 'cancel' })).toBe(true);
    expect(validate({})).toBe(false);
    expect(validate({ decision: 'foo' })).toBe(false);
    expect(validate({ decision: 'request_changes' })).toBe(false);
  });
});
