import { describe, it, expect } from 'vitest';
import { phaseCommitTool, handlePhaseCommitElicitation } from '../src/tools/phaseCommit.js';

describe('Phase Commit Tool', () => {
  it('lists request_phase_commit_approval in tools', async () => {
    expect(phaseCommitTool.name).toBe('request_phase_commit_approval');
  });

  it('commit_and_continue with commit_message returns committed_and_continue and echoes message', async () => {
    const res = await handlePhaseCommitElicitation({
      params: {
        name: 'request_phase_commit_approval',
        arguments: {
          decision: 'commit_and_continue',
          commit_message: 'Phase 3 complete: implemented tool',
        },
      },
    });
    const payload = res.content[0].json;
    expect(payload.status).toBe('committed_and_continue');
    expect(payload.decision).toBe('commit_and_continue');
    expect(payload.commitMessage).toBe('Phase 3 complete: implemented tool');
  });

  it('commit_and_pause with commit_message returns committed_and_pause', async () => {
    const res = await handlePhaseCommitElicitation({
      params: {
        name: 'request_phase_commit_approval',
        arguments: {
          decision: 'commit_and_pause',
          commit_message: 'Commit and pause for review',
        },
      },
    });
    const payload = res.content[0].json;
    expect(payload.status).toBe('committed_and_pause');
    expect(payload.decision).toBe('commit_and_pause');
    expect(payload.commitMessage).toBe('Commit and pause for review');
  });

  it('revise returns needs_revision (notes optional)', async () => {
    const res = await handlePhaseCommitElicitation({
      params: {
        name: 'request_phase_commit_approval',
        arguments: {
          decision: 'revise',
          notes: 'Tweak schema naming',
        },
      },
    });
    const payload = res.content[0].json;
    expect(payload.status).toBe('needs_revision');
    expect(payload.decision).toBe('revise');
    expect(payload.notes).toBe('Tweak schema naming');
  });

  it('abort returns aborted', async () => {
    const res = await handlePhaseCommitElicitation({
      params: {
        name: 'request_phase_commit_approval',
        arguments: {
          decision: 'abort',
        },
      },
    });
    const payload = res.content[0].json;
    expect(payload.status).toBe('aborted');
    expect(payload.decision).toBe('abort');
  });

  it('missing commit_message when required should throw', async () => {
    expect(() =>
      handlePhaseCommitElicitation({
        params: {
          name: 'request_phase_commit_approval',
          arguments: {
            decision: 'commit_and_continue',
          },
        },
      })
    ).toThrow();
    expect(() =>
      handlePhaseCommitElicitation({
        params: {
          name: 'request_phase_commit_approval',
          arguments: {
            decision: 'commit_and_pause',
          },
        },
      })
    ).toThrow();
  });

  it('invalid decision should throw', async () => {
    expect(() =>
      handlePhaseCommitElicitation({
        params: {
          name: 'request_phase_commit_approval',
          arguments: {
            decision: 'invalid',
          },
        },
      })
    ).toThrow();
  });
});
