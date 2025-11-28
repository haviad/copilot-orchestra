import { getPhaseCommitSchema } from '../elicitation/schemas.js';

export const phaseCommitTool = {
  name: 'request_phase_commit_approval',
  description: 'Request approval to commit the current phase and decide next action',
};

function validateAgainstSchema(input) {
  const schema = getPhaseCommitSchema();
  if (typeof input !== 'object' || input === null) throw new Error('Invalid input: must be object');
  if (!('decision' in input)) throw new Error('Missing required field: decision');
  const decision = input.decision;
  if (!schema.properties.decision.enum.includes(decision)) {
    throw new Error(`Invalid decision: ${decision}`);
  }
  if ((decision === 'commit_and_continue' || decision === 'commit_and_pause') && !input.commit_message) {
    throw new Error('commit_message required when decision is commit_and_continue or commit_and_pause');
  }
  return true;
}

export function handlePhaseCommitElicitation(req) {
  const args = req?.params?.arguments || {};
  validateAgainstSchema(args);
  const decision = args.decision;
  const commitMessage = args.commit_message;
  const notes = args.notes;

  let status;
  switch (decision) {
    case 'commit_and_continue':
      status = 'committed_and_continue';
      break;
    case 'commit_and_pause':
      status = 'committed_and_pause';
      break;
    case 'revise':
      status = 'needs_revision';
      break;
    case 'abort':
      status = 'aborted';
      break;
    default:
      throw new Error(`Unhandled decision: ${decision}`);
  }

  const payload = { status, decision };
  if (commitMessage) payload.commitMessage = commitMessage;
  if (notes) payload.notes = notes;

  return {
    content: [
      {
        type: 'json',
        json: payload,
      },
    ],
  };
}

export default { phaseCommitTool, handlePhaseCommitElicitation };
