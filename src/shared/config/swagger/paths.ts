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
  },
  '/auth/refresh': {
    post: {
      tags: ['Authentication'],
      summary: 'Refresh access token',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['refreshToken'],
              properties: {
                refreshToken: { type: 'string', example: '{{refreshToken}}' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'New access token issued' },
        '401': { description: 'Invalid or expired refresh token' }
      }
    }
  },
  '/auth/logout': {
    post: {
      tags: ['Authentication'],
      summary: 'Logout user',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'Logged out successfully' },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/auth/password/reset-request': {
    post: {
      tags: ['Authentication'],
      summary: 'Request password reset OTP',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email'],
              properties: {
                email: { type: 'string', format: 'email', example: 'user@example.com' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'OTP sent to email' },
        '404': { description: 'User not found' }
      }
    }
  },
  '/auth/password/reset': {
    post: {
      tags: ['Authentication'],
      summary: 'Reset password with OTP',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password', 'confirm_password'],
              properties: {
                email: { type: 'string', format: 'email', example: 'user@example.com' },
                password: { type: 'string', example: 'NewSecurePass123!', description: 'Min 8 chars, uppercase, lowercase, digit, special char' },
                confirm_password: { type: 'string', example: 'NewSecurePass123!' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Password reset successfully' },
        '400': { description: 'Validation error' }
      }
    }
  },
  '/auth/password/change': {
    post: {
      tags: ['Authentication'],
      summary: 'Change password (authenticated)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['current_password', 'password', 'confirm_password'],
              properties: {
                current_password: { type: 'string', example: 'OldPass123!' },
                password: { type: 'string', example: 'NewSecurePass123!' },
                confirm_password: { type: 'string', example: 'NewSecurePass123!' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Password changed successfully' },
        '400': { description: 'Validation error' },
        '401': { description: 'Unauthorized' }
      }
    }
  }
};

export const estatePaths = {
  '/estate/register': {
    post: {
      tags: ['Estates'],
      summary: 'Register a new estate (Manager)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/EstateRegistrationRequest' }
          }
        }
      },
      responses: {
        '201': { description: 'Estate created successfully' },
        '400': { description: 'Validation error' },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Manager role required' }
      }
    }
  },
  '/estate/estates': {
    get: {
      tags: ['Estates'],
      summary: 'List all estates',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'search', in: 'query', schema: { type: 'string' } }
      ],
      responses: {
        '200': { description: 'Estate list returned' },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/estate/estates/pending': {
    get: {
      tags: ['Estates'],
      summary: 'Get pending estates awaiting approval (Admin)',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'Pending estates returned' },
        '403': { description: 'Admin role required' }
      }
    }
  },
  '/estate/estates/{estateId}/approve': {
    patch: {
      tags: ['Estates'],
      summary: 'Approve an estate (Admin)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'estateId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'Estate approved' },
        '403': { description: 'Admin role required' },
        '404': { description: 'Estate not found' }
      }
    }
  },
  '/estate/estates/{estateId}/reject': {
    patch: {
      tags: ['Estates'],
      summary: 'Reject an estate (Admin)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'estateId', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { rejection_reason: { type: 'string', example: 'Incomplete documentation' } }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Estate rejected' },
        '403': { description: 'Admin role required' },
        '404': { description: 'Estate not found' }
      }
    }
  },
  '/estate/one/{estateId}': {
    get: {
      tags: ['Estates'],
      summary: 'Get estate by ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'estateId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'Estate details returned' },
        '404': { description: 'Estate not found' }
      }
    }
  },
  '/estate/code/{estate_code}': {
    get: {
      tags: ['Estates'],
      summary: 'Get estate by estate code',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'estate_code', in: 'path', required: true, schema: { type: 'string', example: 'EST-ABCD-1234' } }],
      responses: {
        '200': { description: 'Estate found' },
        '404': { description: 'Estate not found' }
      }
    }
  },
  '/estate/search/{estate_code}': {
    get: {
      tags: ['Estates'],
      summary: 'Search estate by code (public)',
      parameters: [{ name: 'estate_code', in: 'path', required: true, schema: { type: 'string', example: 'EST-ABCD-1234' } }],
      responses: {
        '200': { description: 'Estate found' },
        '404': { description: 'Estate not found' }
      }
    }
  },
  '/estate/invite/{estateId}': {
    post: {
      tags: ['Estates'],
      summary: 'Generate invitation link (Manager)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'estateId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'Invitation link generated' },
        '403': { description: 'Manager role required' }
      }
    }
  },
  '/estate/validate-invite': {
    post: {
      tags: ['Estates'],
      summary: 'Validate an invitation token (public)',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['token'],
              properties: {
                token: { type: 'string', example: '{{inviteToken}}' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Token valid' },
        '400': { description: 'Invalid or expired token' }
      }
    }
  },
  '/estate/join-by-invite': {
    post: {
      tags: ['Estates'],
      summary: 'Join an estate via invitation token',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['token'],
              properties: {
                token: { type: 'string', example: '{{inviteToken}}' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Joined estate successfully' },
        '400': { description: 'Invalid or expired token' },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/estate/residents/bulk-invite': {
    post: {
      tags: ['Estates'],
      summary: 'Bulk invite residents by email (Manager)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['emails'],
              properties: {
                emails: {
                  type: 'array',
                  items: { type: 'string', format: 'email' },
                  example: ['resident1@example.com', 'resident2@example.com']
                }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Invitations sent' },
        '400': { description: 'emails must be a non-empty array' },
        '403': { description: 'Manager role required' }
      }
    }
  },
  '/estate/residents/resend-invite': {
    post: {
      tags: ['Estates'],
      summary: 'Resend invitation to a resident (Manager)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email'],
              properties: {
                email: { type: 'string', format: 'email', example: 'resident@example.com' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Invitation resent' },
        '403': { description: 'Manager role required' }
      }
    }
  },
  '/estate/update/{estateId}': {
    put: {
      tags: ['Estates'],
      summary: 'Update estate details (Manager)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'estateId', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Greenfield Estate Phase 2' },
                type: { type: 'string', enum: ['residential', 'mixed', 'commercial', 'other'] },
                description: { type: 'string' },
                contact_phone: { type: 'string', example: '08012345678' },
                contact_email: { type: 'string', format: 'email' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Estate updated' },
        '403': { description: 'Manager role required' },
        '404': { description: 'Estate not found' }
      }
    }
  },
  '/estate/delete/{estateId}': {
    delete: {
      tags: ['Estates'],
      summary: 'Delete a draft estate (Manager)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'estateId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'Estate deleted' },
        '403': { description: 'Manager role required' },
        '404': { description: 'Estate not found' }
      }
    }
  },
  '/estate/{estateId}/gates': {
    post: {
      tags: ['Estates'],
      summary: 'Add a gate to the estate (Manager)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'estateId', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['gate_name', 'type'],
              properties: {
                gate_name: { type: 'string', example: 'Main Entrance' },
                type: { type: 'string', example: 'entry' },
                is_active: { type: 'boolean', example: true }
              }
            }
          }
        }
      },
      responses: {
        '201': { description: 'Gate created' },
        '403': { description: 'Manager role required' }
      }
    },
    get: {
      tags: ['Estates'],
      summary: 'List estate gates (Manager)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'estateId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'Gate list returned' },
        '403': { description: 'Manager role required' }
      }
    }
  },
  '/estate/{estateId}/residents': {
    get: {
      tags: ['Estates'],
      summary: 'List residents in an estate (Manager)',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'estateId', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
      ],
      responses: {
        '200': { description: 'Resident list returned' },
        '403': { description: 'Manager role required' }
      }
    }
  },
  '/estate/{estateId}/residents/{residentId}': {
    delete: {
      tags: ['Estates'],
      summary: 'Remove a resident from the estate (Manager)',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'estateId', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'residentId', in: 'path', required: true, schema: { type: 'string' } }
      ],
      responses: {
        '200': { description: 'Resident removed' },
        '403': { description: 'Manager role required' },
        '404': { description: 'Resident not found' }
      }
    }
  }
};

export const paymentPaths = {
  '/payment/initiate': {
    post: {
      tags: ['Payments'],
      summary: 'Initiate a payment (Resident)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/PaymentInitiateRequest' }
          }
        }
      },
      responses: {
        '200': { description: 'Payment initialized — returns Paystack authorization URL' },
        '400': { description: 'Validation error' },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/payment/subscription': {
    post: {
      tags: ['Payments'],
      summary: 'Initiate estate subscription (Manager)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SubscriptionInitiateRequest' }
          }
        }
      },
      responses: {
        '200': { description: 'Subscription payment initialized' },
        '400': { description: 'Validation error' },
        '403': { description: 'Manager role required' }
      }
    },
    get: {
      tags: ['Payments'],
      summary: 'Get current subscription (Resident)',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'Subscription details returned' },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/payment/subscription/status': {
    get: {
      tags: ['Payments'],
      summary: 'Get subscription status and banner info (Manager)',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'Subscription status returned' },
        '403': { description: 'Manager role required' }
      }
    }
  },
  '/payment/callback': {
    get: {
      tags: ['Payments'],
      summary: 'Paystack payment callback (public)',
      description: 'Paystack redirects here after a card payment. Reads `reference` from query string.',
      parameters: [
        { name: 'reference', in: 'query', required: true, schema: { type: 'string', example: 'LW_abc123_1234567890' } }
      ],
      responses: {
        '200': { description: 'Payment callback processed' }
      }
    }
  },
  '/payment/verify/{reference}': {
    get: {
      tags: ['Payments'],
      summary: 'Verify a payment by reference (Resident)',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'reference', in: 'path', required: true, schema: { type: 'string', example: 'LW_abc123_1234567890' } }
      ],
      responses: {
        '200': { description: 'Payment verified' },
        '400': { description: 'Payment not successful' },
        '404': { description: 'Payment not found' }
      }
    }
  },
  '/payment/all': {
    get: {
      tags: ['Payments'],
      summary: 'Get all payments for the authenticated user (Resident)',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } }
      ],
      responses: {
        '200': { description: 'Payment list returned' },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/payment/id/{paymentId}': {
    get: {
      tags: ['Payments'],
      summary: 'Get payment by ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'paymentId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'Payment details returned' },
        '404': { description: 'Payment not found' }
      }
    }
  },
  '/payment/ref/{reference}': {
    get: {
      tags: ['Payments'],
      summary: 'Get payment by reference',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'reference', in: 'path', required: true, schema: { type: 'string', example: 'LW_abc123_1234567890' } }],
      responses: {
        '200': { description: 'Payment details returned' },
        '404': { description: 'Payment not found' }
      }
    }
  },
  '/payment/subscription/{subscriptionId}': {
    delete: {
      tags: ['Payments'],
      summary: 'Cancel a subscription (Admin)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'subscriptionId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'Subscription cancelled' },
        '403': { description: 'Admin role required' },
        '404': { description: 'Subscription not found' }
      }
    }
  },
  '/payment/subscription/{subscriptionId}/wallet-payment': {
    patch: {
      tags: ['Payments'],
      summary: 'Toggle wallet auto-payment for subscription (Manager)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'subscriptionId', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['enabled'],
              properties: {
                enabled: { type: 'boolean', example: true }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Wallet payment toggle updated' },
        '403': { description: 'Manager role required' }
      }
    }
  }
};

export const electricityPaths = {
  '/electricity/validate-meter': {
    post: {
      tags: ['Electricity'],
      summary: 'Validate a meter number before purchase',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['meterNumber', 'disco', 'meterType'],
              properties: {
                meterNumber: { type: 'string', example: '04222647382' },
                disco: {
                  type: 'string',
                  example: 'EKEDC',
                  description: 'Distribution company code e.g. EKEDC, IKEDC, AEDC, PHEDC'
                },
                meterType: { type: 'string', enum: ['prepaid', 'postpaid'], example: 'prepaid' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Meter validated — returns customer name and account details' },
        '400': { description: 'Invalid meter or disco' },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/electricity/meters': {
    post: {
      tags: ['Electricity'],
      summary: 'Register a smart meter for auto-load',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['meterNumber', 'disco', 'meterType'],
              properties: {
                meterNumber: { type: 'string', example: '04222647382' },
                disco: { type: 'string', example: 'EKEDC' },
                meterType: { type: 'string', enum: ['prepaid', 'postpaid'], example: 'prepaid' }
              }
            }
          }
        }
      },
      responses: {
        '201': { description: 'Meter registered' },
        '400': { description: 'Validation error or meter already registered' },
        '401': { description: 'Unauthorized' }
      }
    },
    get: {
      tags: ['Electricity'],
      summary: 'Get my registered meters',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'Meter list returned' },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/electricity/meters/{meterId}/auto-load': {
    patch: {
      tags: ['Electricity'],
      summary: 'Toggle auto-load on/off for a meter',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'meterId', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['enabled'],
              properties: {
                enabled: { type: 'boolean', example: true }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Auto-load updated' },
        '404': { description: 'Meter not found' }
      }
    },
    post: {
      tags: ['Electricity'],
      summary: 'Trigger a manual auto-load vend for a meter',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'meterId', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['amount'],
              properties: {
                amount: { type: 'number', example: 5000, description: 'Amount in Naira (minimum ₦500)' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Auto-load triggered — token returned' },
        '400': { description: 'Minimum amount ₦500 required' }
      }
    }
  },
  '/electricity/meters/{meterId}': {
    delete: {
      tags: ['Electricity'],
      summary: 'Remove a registered meter',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'meterId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'Meter deleted' },
        '404': { description: 'Meter not found' }
      }
    }
  },
  '/electricity/vend': {
    post: {
      tags: ['Electricity'],
      summary: 'Purchase electricity token (manual vend)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['meterNumber', 'disco', 'meterType', 'amount'],
              properties: {
                meterNumber: { type: 'string', example: '04222647382' },
                disco: { type: 'string', example: 'EKEDC' },
                meterType: { type: 'string', enum: ['prepaid', 'postpaid'], example: 'prepaid' },
                amount: { type: 'number', example: 5000, description: 'Amount in Naira — minimum ₦500' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Electricity token purchased — token number in response' },
        '400': { description: 'Minimum amount ₦500 / meter validation failed' },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/electricity/requery': {
    post: {
      tags: ['Electricity'],
      summary: 'Requery an electricity transaction',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['reference'],
              properties: {
                reference: { type: 'string', example: 'LW_ELEC_xxxxxxxxxxxx_vtpass' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Transaction status returned' },
        '404': { description: 'Transaction not found' }
      }
    }
  },
  '/electricity/transactions': {
    get: {
      tags: ['Electricity'],
      summary: 'Get electricity transaction history',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } }
      ],
      responses: {
        '200': { description: 'Transaction history returned' },
        '401': { description: 'Unauthorized' }
      }
    }
  }
};

export const accessPaths = {
  '/access/scan': {
    post: {
      tags: ['Access Control'],
      summary: 'Scan an access code at the gate (public)',
      description: 'Process a gate scan — validates the code, records entry or exit, and enforces entry limits. No authentication required.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['code'],
              properties: {
                code: { type: 'string', example: '482917', description: '6-digit access code' },
                gate_id: { type: 'string', example: '{{gateId}}' },
                scanned_by: { type: 'string', example: '{{userId}}', description: 'Security personnel user ID' },
                scan_type: { type: 'string', enum: ['entry', 'exit'], example: 'entry' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Scan processed — action (entry/exit) and access log returned' },
        '400': { description: 'Code required or entry limit reached' },
        '404': { description: 'Access code not found' }
      }
    }
  },
  '/access': {
    post: {
      tags: ['Access Control'],
      summary: 'Create an access request record',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AccessRecordRequest' }
          }
        }
      },
      responses: {
        '201': { description: 'Access request created' },
        '401': { description: 'Unauthorized' },
        '403': { description: 'User not linked to an estate' }
      }
    },
    get: {
      tags: ['Access Control'],
      summary: 'Get access logs',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'estate_id', in: 'query', schema: { type: 'string' } },
        { name: 'user_id', in: 'query', schema: { type: 'string' } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'used', 'revoked', 'expired'] } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } }
      ],
      responses: {
        '200': { description: 'Access log list returned' },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/access/active': {
    get: {
      tags: ['Access Control'],
      summary: 'Get active access records for a user',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'user_id', in: 'query', required: true, schema: { type: 'string' } },
        { name: 'estate_id', in: 'query', required: true, schema: { type: 'string' } }
      ],
      responses: {
        '200': { description: 'Active access records returned' },
        '400': { description: 'user_id and estate_id are required' }
      }
    }
  },
  '/access/{accessId}/approve': {
    patch: {
      tags: ['Access Control'],
      summary: 'Approve an access request',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'accessId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'Access approved' },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Access record not found' }
      }
    }
  },
  '/access/{accessId}/revoke': {
    patch: {
      tags: ['Access Control'],
      summary: 'Revoke an access record',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'accessId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'Access revoked' },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Access record not found' }
      }
    }
  }
};

export const accessCodePaths = {
  '/access-codes/generate': {
    post: {
      tags: ['Access Control'],
      summary: 'Generate a visitor access code (Resident)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AccessCodeGenerateRequest' }
          }
        }
      },
      responses: {
        '201': { description: 'Access code generated — includes shareMessage for sending to visitor' },
        '400': { description: 'visitor_name and valid_until are required' },
        '403': { description: 'User not linked to an estate or security role not allowed' }
      }
    }
  },
  '/access-codes': {
    get: {
      tags: ['Access Control'],
      summary: 'Get access codes (own codes for residents; estate-wide for managers)',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'Access code list returned' },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/access-codes/validate': {
    post: {
      tags: ['Access Control'],
      summary: 'Validate an access code before approving entry',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['code'],
              properties: {
                code: { type: 'string', example: '482917' },
                scan_type: { type: 'string', enum: ['entry', 'exit'], example: 'entry' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Code valid — returns access log with remaining_entries' },
        '400': { description: 'Code expired or exit-only code used for entry' },
        '404': { description: 'Invalid or expired access code' }
      }
    }
  },
  '/access-codes/approve': {
    post: {
      tags: ['Access Control'],
      summary: 'Approve access and record entry/exit',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['code'],
              properties: {
                code: { type: 'string', example: '482917' },
                gate_id: { type: 'string', example: '{{gateId}}' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Access approved — entry or exit recorded; push notification sent to resident' },
        '400': { description: 'Maximum entries reached' },
        '403': { description: 'Security account inactive' },
        '404': { description: 'Access code not found' }
      }
    }
  },
  '/access-codes/reject': {
    post: {
      tags: ['Access Control'],
      summary: 'Reject a visitor access attempt',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['code'],
              properties: {
                code: { type: 'string', example: '482917' },
                reason: { type: 'string', example: 'Unauthorized visitor' },
                gate_id: { type: 'string', example: '{{gateId}}' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Access rejected — push notification sent to resident' },
        '404': { description: 'Access code not found' }
      }
    }
  },
  '/access-codes/{logId}/share-url': {
    get: {
      tags: ['Access Control'],
      summary: 'Get shareable maps URL for an access code (Resident)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'logId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'Short URL and full share message returned' },
        '404': { description: 'Access code not found or already revoked' }
      }
    }
  },
  '/access-codes/{code}/confirm': {
    post: {
      tags: ['Access Control'],
      summary: 'Confirm visitor check-in (marks code as used)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'code', in: 'path', required: true, schema: { type: 'string', example: '482917' } }],
      responses: {
        '200': { description: 'Access confirmed' },
        '404': { description: 'Access code not found' }
      }
    }
  },
  '/access-codes/{code}/revoke': {
    post: {
      tags: ['Access Control'],
      summary: 'Revoke an active access code (Resident)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'code', in: 'path', required: true, schema: { type: 'string', example: '482917' } }],
      responses: {
        '200': { description: 'Access code revoked' },
        '404': { description: 'Code not found or cannot be revoked' }
      }
    }
  }
};

export const notificationPaths = {
  '/notifications': {
    get: {
      tags: ['Notifications'],
      summary: 'Get notifications for the authenticated user',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } }
      ],
      responses: {
        '200': { description: 'Notification list returned' },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/notifications/mark-all-read': {
    patch: {
      tags: ['Notifications'],
      summary: 'Mark all notifications as read',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'All notifications marked as read' },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/notifications/clear-all': {
    delete: {
      tags: ['Notifications'],
      summary: 'Clear all notifications',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'All notifications cleared' },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/notifications/{id}': {
    patch: {
      tags: ['Notifications'],
      summary: 'Mark a notification as read',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'Notification marked as read' },
        '404': { description: 'Notification not found' }
      }
    }
  },
  '/notifications/preferences': {
    get: {
      tags: ['Notifications'],
      summary: 'Get notification preferences',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'Preferences returned' },
        '401': { description: 'Unauthorized' }
      }
    },
    put: {
      tags: ['Notifications'],
      summary: 'Update notification preferences',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                push_notifications: { type: 'boolean', example: true },
                email_notifications: { type: 'boolean', example: true },
                sms_notifications: { type: 'boolean', example: false }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Preferences updated' },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/notifications/test/sms': {
    post: {
      tags: ['Notifications'],
      summary: 'Send a test SMS notification',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['phone_number'],
              properties: {
                phone_number: { type: 'string', example: '08065876770' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Test SMS sent' },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/notifications/queue/stats': {
    get: {
      tags: ['Notifications'],
      summary: 'Get notification queue statistics',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'Queue stats returned' },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/notifications/bulk': {
    post: {
      tags: ['Notifications'],
      summary: 'Send bulk notifications',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['recipients', 'message'],
              properties: {
                recipients: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['{{userId1}}', '{{userId2}}']
                },
                message: { type: 'string', example: 'Estate maintenance scheduled for tomorrow at 9am.' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Bulk notifications queued' },
        '401': { description: 'Unauthorized' }
      }
    }
  }
};

export const supportPaths = {
  '/support/info': {
    get: {
      tags: ['Support'],
      summary: 'Get support contact info',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'Support contact info returned' }
      }
    }
  },
  '/support/tickets': {
    post: {
      tags: ['Support'],
      summary: 'Create a support ticket',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['subject', 'description'],
              properties: {
                subject: { type: 'string', example: 'Cannot generate access code' },
                description: { type: 'string', example: 'When I try to generate an access code I get an error message.' },
                category: { type: 'string', example: 'access' }
              }
            }
          }
        }
      },
      responses: {
        '201': { description: 'Ticket created' },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/support/tickets/my': {
    get: {
      tags: ['Support'],
      summary: 'Get my support tickets',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'Ticket list returned' },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/support/tickets/open': {
    get: {
      tags: ['Support'],
      summary: 'Get all open tickets (Agent/Admin)',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'Open ticket list returned' },
        '403': { description: 'Permission required' }
      }
    }
  },
  '/support/tickets/assigned': {
    get: {
      tags: ['Support'],
      summary: 'Get tickets assigned to me (Agent)',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'Assigned ticket list returned' },
        '403': { description: 'Permission required' }
      }
    }
  },
  '/support/tickets/{ticketId}/messages': {
    get: {
      tags: ['Support'],
      summary: 'Get messages for a ticket',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'ticketId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'Messages returned' },
        '404': { description: 'Ticket not found' }
      }
    },
    post: {
      tags: ['Support'],
      summary: 'Send a message on a support ticket',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'ticketId', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['message'],
              properties: {
                message: { type: 'string', example: 'I still need help with this issue.' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Message sent' },
        '404': { description: 'Ticket not found' }
      }
    }
  },
  '/support/tickets/{ticketId}/assign': {
    post: {
      tags: ['Support'],
      summary: 'Assign a ticket to an agent (Admin)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'ticketId', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['assigned_to'],
              properties: {
                assigned_to: { type: 'string', example: '{{agentUserId}}' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Ticket assigned' },
        '403': { description: 'Permission required' }
      }
    }
  },
  '/support/tickets/{ticketId}/status': {
    patch: {
      tags: ['Support'],
      summary: 'Update ticket status (Agent/Admin)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'ticketId', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['status'],
              properties: {
                status: {
                  type: 'string',
                  enum: ['open', 'in_progress', 'resolved', 'closed'],
                  example: 'resolved'
                }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Status updated' },
        '403': { description: 'Permission required' }
      }
    }
  }
};

export const communityPaths = {
  '/community/messages': {
    get: {
      tags: ['Community'],
      summary: 'Get community messages for the estate',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
        { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } }
      ],
      responses: {
        '200': { description: 'Message list returned' },
        '401': { description: 'Unauthorized' }
      }
    },
    post: {
      tags: ['Community'],
      summary: 'Send a community message (supports optional file attachment)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['message'],
              properties: {
                message: { type: 'string', example: 'Reminder: estate meeting this Saturday at 10am.' }
              }
            }
          },
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Check out this document.' },
                file: { type: 'string', format: 'binary' }
              }
            }
          }
        }
      },
      responses: {
        '201': { description: 'Message sent' },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/community/messages/{messageId}/reactions': {
    post: {
      tags: ['Community'],
      summary: 'Add a reaction to a message',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'messageId', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['emoji'],
              properties: {
                emoji: { type: 'string', example: '👍' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Reaction added' },
        '404': { description: 'Message not found' }
      }
    }
  },
  '/community/messages/{messageId}/reactions/{emoji}': {
    delete: {
      tags: ['Community'],
      summary: 'Remove a reaction from a message',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'messageId', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'emoji', in: 'path', required: true, schema: { type: 'string', example: '👍' } }
      ],
      responses: {
        '200': { description: 'Reaction removed' },
        '404': { description: 'Message or reaction not found' }
      }
    }
  },
  '/community/announcements': {
    post: {
      tags: ['Community'],
      summary: 'Send an estate announcement',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['announcement_text'],
              properties: {
                announcement_text: { type: 'string', example: 'Important: Water supply will be cut off on Saturday from 8am to 12pm.' }
              }
            }
          }
        }
      },
      responses: {
        '201': { description: 'Announcement sent' },
        '401': { description: 'Unauthorized' }
      }
    }
  }
};

export const billsPaths = {
  '/bills/providers': {
    get: {
      tags: ['Bills'],
      summary: 'Get all bill providers',
      description: 'Returns all available bill providers (DISCOs, telcos, TV providers) grouped by category. No auth required.',
      responses: { '200': { description: 'Providers list returned' } }
    }
  },
  '/bills/airtime/pay': {
    post: {
      tags: ['Bills'],
      summary: 'Purchase airtime',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['phone', 'amount', 'serviceID'],
              properties: {
                phone: { type: 'string', example: '08012345678' },
                amount: { type: 'number', example: 1000 },
                serviceID: { type: 'string', example: 'mtn', description: 'Telco code: mtn, airtel, glo, etisalat' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Airtime purchased successfully' },
        '400': { description: 'Validation error' },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/bills/data/plans/{serviceID}': {
    get: {
      tags: ['Bills'],
      summary: 'Get data plans for a telco',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'serviceID', in: 'path', required: true, schema: { type: 'string', example: 'mtn-data' } }],
      responses: { '200': { description: 'Data plans returned' }, '401': { description: 'Unauthorized' } }
    }
  },
  '/bills/data/pay': {
    post: {
      tags: ['Bills'],
      summary: 'Purchase mobile data',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['phone', 'serviceID', 'variation_code'],
              properties: {
                phone: { type: 'string', example: '08012345678' },
                serviceID: { type: 'string', example: 'mtn-data' },
                variation_code: { type: 'string', example: 'mtn-10mb-100' }
              }
            }
          }
        }
      },
      responses: { '200': { description: 'Data purchased' }, '400': { description: 'Validation error' }, '401': { description: 'Unauthorized' } }
    }
  },
  '/bills/tv/verify': {
    post: {
      tags: ['Bills'],
      summary: 'Verify a TV smartcard / IUC number',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['smartcard_number', 'serviceID'],
              properties: {
                smartcard_number: { type: 'string', example: '1234567890' },
                serviceID: { type: 'string', example: 'dstv', description: 'dstv, gotv, startimes' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Smartcard verified', content: { 'application/json': { schema: { type: 'object', properties: { customerName: { type: 'string' }, status: { type: 'string' } } } } } },
        '400': { description: 'Invalid smartcard' },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/bills/tv/plans/{serviceID}': {
    get: {
      tags: ['Bills'],
      summary: 'Get TV subscription plans for a provider',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'serviceID', in: 'path', required: true, schema: { type: 'string', example: 'dstv' } }],
      responses: { '200': { description: 'TV plans returned' }, '401': { description: 'Unauthorized' } }
    }
  },
  '/bills/tv/pay': {
    post: {
      tags: ['Bills'],
      summary: 'Purchase a TV subscription',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['smartcard_number', 'serviceID', 'variation_code', 'amount'],
              properties: {
                smartcard_number: { type: 'string', example: '1234567890' },
                serviceID: { type: 'string', example: 'dstv' },
                variation_code: { type: 'string', example: 'dstv-padi' },
                amount: { type: 'number', example: 2500 },
                phone: { type: 'string', example: '08012345678' }
              }
            }
          }
        }
      },
      responses: { '200': { description: 'Subscription purchased' }, '400': { description: 'Validation error' }, '401': { description: 'Unauthorized' } }
    }
  },
  '/bills/electricity/verify': {
    post: {
      tags: ['Bills'],
      summary: 'Verify an electricity meter (VTPass)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['billersCode', 'serviceID', 'type'],
              properties: {
                billersCode: { type: 'string', example: '04222647382' },
                serviceID: { type: 'string', example: 'ekedc-prepaid' },
                type: { type: 'string', enum: ['prepaid', 'postpaid'], example: 'prepaid' }
              }
            }
          }
        }
      },
      responses: { '200': { description: 'Meter verified' }, '400': { description: 'Invalid meter' }, '401': { description: 'Unauthorized' } }
    }
  },
  '/bills/electricity/pay': {
    post: {
      tags: ['Bills'],
      summary: 'Pay electricity bill (VTPass)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['billersCode', 'serviceID', 'variation_code', 'amount', 'phone'],
              properties: {
                billersCode: { type: 'string', example: '04222647382' },
                serviceID: { type: 'string', example: 'ekedc-prepaid' },
                variation_code: { type: 'string', example: 'prepaid' },
                amount: { type: 'number', example: 5000 },
                phone: { type: 'string', example: '08012345678' }
              }
            }
          }
        }
      },
      responses: { '200': { description: 'Electricity token purchased' }, '400': { description: 'Validation error' }, '401': { description: 'Unauthorized' } }
    }
  },
  '/bills/requery/{requestId}': {
    get: {
      tags: ['Bills'],
      summary: 'Requery a bill transaction status',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'requestId', in: 'path', required: true, schema: { type: 'string' }, description: 'The requestId returned from the original transaction' }],
      responses: { '200': { description: 'Transaction status returned' }, '401': { description: 'Unauthorized' }, '404': { description: 'Transaction not found' } }
    }
  },
  '/bills/transactions': {
    get: {
      tags: ['Bills'],
      summary: 'Get bill transaction history',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } }
      ],
      responses: { '200': { description: 'Transaction list returned' }, '401': { description: 'Unauthorized' } }
    }
  },
  '/bills/webhook/vtpass': {
    post: {
      tags: ['Webhooks'],
      summary: 'VTPass webhook receiver',
      description: 'Receives inbound VTPass transaction status webhooks. No bearer auth — verified by provider signature.',
      responses: { '200': { description: 'Webhook processed' } }
    }
  }
};

export const walletPaths = {
  '/wallet/account': {
    get: {
      tags: ['Wallet'],
      summary: 'Get wallet account details',
      description: "Returns the authenticated resident's wallet account info including virtual account number if provisioned.",
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'Wallet account details' },
        '401': { description: 'Unauthorized' }
      }
    }
  },
  '/wallet/balance': {
    get: {
      tags: ['Wallet'],
      summary: 'Get wallet balance',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'Wallet balance returned' }, '401': { description: 'Unauthorized' } }
    }
  },
  '/wallet/fund': {
    post: {
      tags: ['Wallet'],
      summary: 'Fund wallet via Paystack',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['amount'],
              properties: {
                amount: { type: 'number', example: 5000, description: 'Amount in Naira (minimum ₦100)' }
              }
            }
          }
        }
      },
      responses: { '200': { description: 'Payment initialized' }, '400': { description: 'Amount below minimum' }, '401': { description: 'Unauthorized' } }
    }
  },
  '/wallet/verify': {
    post: {
      tags: ['Wallet'],
      summary: 'Verify wallet funding',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { type: 'object', required: ['reference'], properties: { reference: { type: 'string', example: 'LW_abc123_1234567890' } } }
          }
        }
      },
      responses: { '200': { description: 'Wallet credited' }, '400': { description: 'Reference missing or payment not successful' }, '401': { description: 'Unauthorized' } }
    }
  },
  '/wallet/transactions': {
    get: {
      tags: ['Wallet'],
      summary: 'Get wallet transaction history',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } }
      ],
      responses: { '200': { description: 'Transaction history returned' }, '401': { description: 'Unauthorized' } }
    }
  }
};

export const collectionsPaths = {
  '/collections/fees': {
    get: {
      tags: ['Collections'],
      summary: 'Get estate fees',
      description: 'Returns all fees defined for the estate. Accessible to any authenticated estate member.',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'Fee list returned' }, '401': { description: 'Unauthorized' } }
    },
    post: {
      tags: ['Collections'],
      summary: 'Create a fee (Manager)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'amount', 'frequency'],
              properties: {
                name: { type: 'string', example: 'Monthly Service Charge' },
                amount: { type: 'number', example: 5000 },
                frequency: { type: 'string', enum: ['monthly', 'quarterly', 'annually', 'one_time'], example: 'monthly' },
                description: { type: 'string' }
              }
            }
          }
        }
      },
      responses: { '201': { description: 'Fee created' }, '401': { description: 'Unauthorized' }, '403': { description: 'Manager role required' } }
    }
  },
  '/collections/fees/{feeId}': {
    patch: {
      tags: ['Collections'],
      summary: 'Update a fee (Manager)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'feeId', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, amount: { type: 'number' }, is_active: { type: 'boolean' } } } } } },
      responses: { '200': { description: 'Fee updated' }, '403': { description: 'Manager role required' }, '404': { description: 'Fee not found' } }
    },
    delete: {
      tags: ['Collections'],
      summary: 'Delete a fee (Manager)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'feeId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'Fee deleted' }, '403': { description: 'Manager role required' } }
    }
  },
  '/collections/invoices/generate': {
    post: {
      tags: ['Collections'],
      summary: 'Generate invoices for residents (Manager)',
      description: 'Bulk-generate invoices for all active residents in the estate for a given fee and billing period.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['fee_id', 'due_date'],
              properties: {
                fee_id: { type: 'string' },
                due_date: { type: 'string', format: 'date', example: '2026-06-01' },
                resident_ids: { type: 'array', items: { type: 'string' }, description: 'Optional subset; omit to target all residents' }
              }
            }
          }
        }
      },
      responses: { '200': { description: 'Invoices generated' }, '403': { description: 'Manager role required' } }
    }
  },
  '/collections/invoices': {
    get: {
      tags: ['Collections'],
      summary: 'Get my invoices (Resident)',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'Invoice list' }, '401': { description: 'Unauthorized' } }
    }
  },
  '/collections/invoices/{invoiceId}/pay': {
    post: {
      tags: ['Collections'],
      summary: 'Pay an invoice',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'invoiceId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'Payment initiated' }, '404': { description: 'Invoice not found' } }
    }
  },
  '/collections/invoices/{invoiceId}/waive': {
    patch: {
      tags: ['Collections'],
      summary: 'Waive an invoice (Manager)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'invoiceId', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: { required: false, content: { 'application/json': { schema: { type: 'object', properties: { reason: { type: 'string', example: 'Resident hardship waiver' } } } } } },
      responses: { '200': { description: 'Invoice waived' }, '403': { description: 'Manager role required' } }
    }
  },
  '/collections/summary': {
    get: {
      tags: ['Collections'],
      summary: 'Get collections summary (Manager)',
      description: 'Returns aggregate statistics — total billed, collected, outstanding, and waived — for the estate.',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'Collections summary' }, '403': { description: 'Manager role required' } }
    }
  },
  '/collections/residents/{residentId}/status': {
    get: {
      tags: ['Collections'],
      summary: "Get a resident's payment status (Manager)",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'residentId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'Resident payment status' }, '403': { description: 'Manager role required' } }
    }
  },
  '/collections/withdraw': {
    post: {
      tags: ['Collections'],
      summary: 'Request a withdrawal (Manager)',
      description: "Request a payout from the estate's collected funds to a designated bank account.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { type: 'object', required: ['amount'], properties: { amount: { type: 'number', example: 50000 }, note: { type: 'string', example: 'Monthly disbursement' } } }
          }
        }
      },
      responses: { '200': { description: 'Withdrawal requested' }, '403': { description: 'Manager role required' } }
    }
  },
  '/collections/withdrawals': {
    get: {
      tags: ['Collections'],
      summary: 'Get withdrawal history (Manager)',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'Withdrawal list' }, '403': { description: 'Manager role required' } }
    }
  }
};
