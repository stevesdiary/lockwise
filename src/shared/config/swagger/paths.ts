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
                amount: { type: 'number', example: 5000, description: 'Amount in kobo (minimum ₦100 = 10000)' }
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
      requestBody: { required: false, content: { 'application/json': { schema: { type: 'object', properties: { reason: { type: 'string' } } } } } },
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
            schema: { type: 'object', required: ['amount'], properties: { amount: { type: 'number', example: 50000 }, note: { type: 'string' } } }
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
