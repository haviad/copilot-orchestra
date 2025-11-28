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

export default { getPlanApprovalSchema };
