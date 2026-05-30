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
      password: { type: 'string', example: 'SecurePass123!' }
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
  },
  UserRegistrationRequest: {
    type: 'object',
    required: ['first_name', 'last_name', 'email', 'password', 'confirm_password'],
    properties: {
      first_name: { type: 'string', example: 'John' },
      last_name: { type: 'string', example: 'Doe' },
      email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
      password: {
        type: 'string',
        minLength: 8,
        description: 'Must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.',
        example: 'SecurePass123!'
      },
      confirm_password: { type: 'string', example: 'SecurePass123!' }
    }
  },
  EstateRegistrationRequest: {
    type: 'object',
    required: ['name', 'type'],
    properties: {
      name: { type: 'string', example: 'Greenfield Estate' },
      type: {
        type: 'string',
        enum: ['residential', 'mixed', 'commercial', 'other'],
        example: 'residential'
      },
      address: {
        type: 'object',
        properties: {
          street: { type: 'string', example: '12 Palm Avenue' },
          city: { type: 'string', example: 'Lekki' },
          country: { type: 'string', example: 'Nigeria' }
        }
      },
      state: { type: 'string', example: 'Lagos' },
      country_code: { type: 'string', example: 'NG' },
      contact_phone: { type: 'string', example: '08012345678' },
      contact_email: { type: 'string', format: 'email', example: 'manager@greenfieldestates.com' },
      number_of_appartments: { type: 'integer', example: 50 },
      access_points: {
        type: 'array',
        items: {
          type: 'object',
          required: ['gate_name', 'type'],
          properties: {
            gate_name: { type: 'string', example: 'Main Gate' },
            type: { type: 'string', example: 'entry' },
            is_active: { type: 'boolean', example: true }
          }
        }
      }
    }
  },
  AccessCodeGenerateRequest: {
    type: 'object',
    required: ['visitor_name', 'valid_until'],
    properties: {
      visitor_name: { type: 'string', example: 'Jane Smith' },
      valid_until: { type: 'string', format: 'date-time', example: '2026-06-01T18:00:00.000Z' },
      valid_from: { type: 'string', format: 'date-time', example: '2026-05-30T08:00:00.000Z' },
      visitor_phone: { type: 'string', example: '08098765432' },
      access_type: {
        type: 'string',
        enum: ['guest', 'delivery', 'domestic_staff', 'service', 'maintenance', 'other'],
        example: 'guest'
      },
      is_multi_entry: { type: 'boolean', example: false },
      max_entries: { type: 'integer', example: 1 },
      access_direction: {
        type: 'string',
        enum: ['entry', 'exit', 'both'],
        example: 'entry'
      }
    }
  },
  AccessRecordRequest: {
    type: 'object',
    properties: {
      scheduled_entry_date: { type: 'string', format: 'date-time', example: '2026-05-30T09:00:00.000Z' },
      scheduled_exit_date: { type: 'string', format: 'date-time', example: '2026-05-30T17:00:00.000Z' },
      valid_from: { type: 'string', format: 'date-time', example: '2026-05-30T09:00:00.000Z' },
      valid_until: { type: 'string', format: 'date-time', example: '2026-05-30T17:00:00.000Z' },
      access_type: {
        type: 'string',
        enum: ['guest', 'delivery', 'domestic_staff', 'service', 'maintenance', 'other'],
        example: 'guest'
      },
      vehicle_number: { type: 'string', example: 'LAG-123-XY' },
      remarks: { type: 'string', example: 'Scheduled delivery visit' },
      is_multi_entry: { type: 'boolean', example: false },
      max_entries: { type: 'integer', example: 1 }
    }
  },
  PaymentInitiateRequest: {
    type: 'object',
    required: ['amount', 'paymentMethod'],
    properties: {
      amount: { type: 'number', example: 50000, description: 'Amount in Naira (e.g. 50000 = ₦50,000)' },
      paymentMethod: {
        type: 'string',
        enum: ['card', 'bank_transfer', 'ussd'],
        example: 'card'
      },
      email: { type: 'string', format: 'email', example: 'resident@example.com' },
      currency: { type: 'string', example: 'NGN', default: 'NGN' }
    }
  },
  SubscriptionInitiateRequest: {
    type: 'object',
    required: ['plan_id'],
    properties: {
      plan_id: { type: 'string', example: '{{planId}}' },
      paymentMethod: { type: 'string', example: 'card', default: 'card' }
    }
  }
};
