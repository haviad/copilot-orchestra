import { describe, it, expect } from 'vitest';
import { planApprovalTool, handlePlanApprovalElicitation } from '../src/tools/planApproval.js';

describe('Plan Approval Tool', () => {
  it('lists request_plan_approval in tools', async () => {
    expect(planApprovalTool.name).toBe('request_plan_approval');
  });

  it('accepts decision=approve with optional comments, returns approved', async () => {
    const res = await handlePlanApprovalElicitation({
      params: {
        name: 'request_plan_approval',
        arguments: {
          decision: 'approve',
          comments: 'Looks great',
        },
      },
    });
    expect(res).toBeDefined();
    expect(res.content?.[0]?.type).toBe('json');
    const payload = res.content[0].json;
    expect(payload.status).toBe('approved');
    expect(payload.decision).toBe('approve');
    expect(payload.comments).toBe('Looks great');
    expect(typeof payload.approvalSummary).toBe('string');
  });

  it('handles decision=request_changes with comments required', async () => {
    const res = await handlePlanApprovalElicitation({
      params: {
        name: 'request_plan_approval',
        arguments: {
          decision: 'request_changes',
          comments: 'Please adjust timelines',
        },
      },
    });
    expect(res.content?.[0]?.type).toBe('json');
    const payload = res.content[0].json;
    expect(payload.status).toBe('needs_changes');
    expect(payload.decision).toBe('request_changes');
    expect(payload.comments).toBe('Please adjust timelines');
  });

  it('handles decision=cancel returns cancelled', async () => {
    const res = await handlePlanApprovalElicitation({
      params: {
        name: 'request_plan_approval',
        arguments: {
          decision: 'cancel',
          comments: 'Stopping this plan',
        },
      },
    });
    const payload = res.content[0].json;
    expect(payload.status).toBe('cancelled');
    expect(payload.decision).toBe('cancel');
  });

  it('rejects invalid decision values', async () => {
    expect(() =>
      handlePlanApprovalElicitation({
        params: {
          name: 'request_plan_approval',
          arguments: {
            decision: 'invalid',
          },
        },
      })
    ).toThrow();
  });

  it('rejects missing required fields', async () => {
    expect(() =>
      handlePlanApprovalElicitation({
        params: {
          name: 'request_plan_approval',
          arguments: {},
        },
      })
    ).toThrow();
  });
});
