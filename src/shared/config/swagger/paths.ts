export const authPaths = {
  '/user/register': {
    post: {
      tags: ['Users'],
      summary: 'Register user',
      description: 'Register a new Lockwise user account.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UserRegistrationRequest'
            }
          }
        }
      },
      responses: {
        '201': { description: 'User registered successfully' },
        '400': {
          description: 'Invalid request payload',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  },
  '/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'Login user',
      description: 'Authenticate a user with email and password.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/LoginRequest' }
          }
        }
      },
      responses: {
        '200': {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginResponse' }
            }
          }
        },
        '400': {
          description: 'Invalid request payload',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    }
  }
  // Add more auth paths here
};

export const estatePaths = {
  // Estate-related paths
};

export const paymentPaths = {
  // Payment-related paths
};

export const electricityPaths = {
  // Electricity-related paths
};

export const billsPaths = {
  // Bills-related paths
};

export const walletPaths = {
  // Wallet-related paths
};
