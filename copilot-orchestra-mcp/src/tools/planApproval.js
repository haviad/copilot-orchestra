import { getPlanApprovalSchema } from '../elicitation/schemas.js';

export const planApprovalTool = {
  name: 'request_plan_approval',
  description: 'Request user approval for the plan',
};

function validateAgainstSchema(input) {
  const schema = getPlanApprovalSchema();
  if (typeof input !== 'object' || input === null) throw new Error('Invalid input: must be object');
  if (!('decision' in input)) throw new Error('Missing required field: decision');
  const decision = input.decision;
  if (!schema.properties.decision.enum.includes(decision)) {
    throw new Error(`Invalid decision: ${decision}`);
  }
  if (decision === 'request_changes' && !input.comments) {
    throw new Error('comments required when decision is request_changes');
  }
  return true;
}

export function handlePlanApprovalElicitation(req) {
  const args = req?.params?.arguments || {};
  validateAgainstSchema(args);
  const decision = args.decision;
  const comments = args.comments;

  let status;
  let approvalSummary;
  switch (decision) {
    case 'approve':
      status = 'approved';
      approvalSummary = 'Plan approved';
      break;
    case 'request_changes':
      status = 'needs_changes';
      approvalSummary = 'Plan requires changes';
      break;
    case 'cancel':
      status = 'cancelled';
      approvalSummary = 'Plan approval cancelled';
      break;
    default:
      throw new Error(`Unhandled decision: ${decision}`);
  }

  const payload = {
    status,
    decision,
  };
  if (comments) payload.comments = comments;
  if (approvalSummary) payload.approvalSummary = approvalSummary;

  return {
    content: [
      {
        type: 'json',
        json: payload,
      },
    ],
  };
}

export default { planApprovalTool, handlePlanApprovalElicitation };
