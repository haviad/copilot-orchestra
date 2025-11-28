export function getPlanApprovalSchema() {
  return {
    type: 'object',
    properties: {
      decision: {
        type: 'string',
        enum: ['approve', 'request_changes', 'cancel'],
      },
      comments: {
        type: 'string',
      },
      approval_summary: {
        type: 'string',
      },
    },
    required: ['decision'],
    additionalProperties: false,
  };
}

export function getPhaseCommitSchema() {
  return {
    type: 'object',
    properties: {
      decision: {
        type: 'string',
        enum: ['commit_and_continue', 'commit_and_pause', 'revise', 'abort'],
      },
      commit_message: {
        type: 'string',
      },
      notes: {
        type: 'string',
      },
    },
    required: ['decision'],
    additionalProperties: false,
  };
}

export default { getPlanApprovalSchema, getPhaseCommitSchema };
