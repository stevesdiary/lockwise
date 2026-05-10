export const schemas = {
  Error: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'error' },
      message: { type: 'string' },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: { type: 'string' },
            message: { type: 'string' },
            type: { type: 'string' }
          }
        }
      }
    }
  },
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'user@example.com' },
      password: { type: 'string', example: 'password123' }
    }
  },
  LoginResponse: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'success' },
      data: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string' },
              estate_id: { type: 'string' }
            }
          }
        }
      }
    }
  }
  // Add more schemas here - move from main swagger.ts
};
