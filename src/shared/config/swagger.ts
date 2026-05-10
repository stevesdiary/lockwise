import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lockwise API',
      version: '1.0.0',
      description: 'Lockwise Access Management System API Documentation - Complete API for property access management, visitor control, payments, community features, and estate operations.',
      contact: {
        name: 'Stephen O.',
        email: 'support@lockwise.com'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3002/api/v1',
        description: 'Local development server'
      },
      {
        url: 'https://lockwise.onrender.com/api/v1',
        description: 'Production server (Render)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
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
        },
        UserRegistrationRequest: {
          type: 'object',
          required: ['first_name', 'last_name', 'email', 'password', 'phone', 'user_type'],
          properties: {
            title: {
              type: 'string',
              enum: ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof', 'Alhj', 'Hon.', 'Chief', 'HRH', 'HRM'],
              example: 'Mr'
            },
            first_name: { type: 'string', example: 'Steve' },
            last_name: { type: 'string', example: 'Oyeyemi' },
            email: { type: 'string', format: 'email', example: 'steve@example.com' },
            password: {
              type: 'string',
              example: 'SecurePass123!',
              description: 'Must include uppercase, lowercase, number, and special character'
            },
            phone: {
              type: 'string',
              example: '08065876770',
              description: 'Valid Nigerian phone number'
            },
            user_type: {
              type: 'string',
              enum: ['resident', 'security', 'manager', 'admin', 'master'],
              example: 'resident'
            },
            estate_code: {
              type: 'string',
              example: 'EST-AB12CD34',
              description: 'Optional when linking a resident to an existing estate during registration'
            },
            role_id: { type: 'string', example: 'role-id-123', description: 'Optional explicit role override' }
          }
        },
        PaymentInitiation: {
          type: 'object',
          required: ['amount', 'paymentMethod'],
          properties: {
            amount: { type: 'number', example: 50000 },
            email: {
              type: 'string',
              format: 'email',
              example: 'resident@example.com',
              description: 'Optional. The authenticated user email is used when omitted.'
            },
            currency: { type: 'string', default: 'NGN', example: 'NGN' },
            paymentMethod: { type: 'string', example: 'card' }
          }
        },
        SubscriptionInitiationRequest: {
          type: 'object',
          required: ['plan_id'],
          properties: {
            plan_id: { type: 'string', example: 'plan-id-123' },
            paymentMethod: { type: 'string', example: 'card', default: 'card' }
          }
        },
        PaymentResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            statusCode: { type: 'number', example: 200 },
            data: {
              type: 'object',
              properties: {
                reference: { type: 'string' },
                authorization_url: { type: 'string' },
                access_code: { type: 'string' }
              }
            }
          }
        },
        Estate: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'Sunset Gardens' },
            address: { type: 'string', example: '123 Main St, Lagos' },
            city: { type: 'string', example: 'Lagos' },
            state: { type: 'string', example: 'Lagos' },
            country: { type: 'string', example: 'Nigeria' },
            estate_code: { type: 'string', example: 'EST123456' },
            total_number_of_apartments: { type: 'number', example: 200 },
            total_floors: { type: 'number', example: 10 },
            total_parking_spaces: { type: 'number', example: 250 },
            number_of_staff: { type: 'number', example: 20 },
            status: { type: 'string', enum: ['active', 'inactive', 'under_maintenance', 'suspended', 'pending'], example: 'pending' },
            contact_phone: { type: 'string', example: '+2348012345678' },
            contact_email: { type: 'string', example: 'info@sunsetgardens.com' },
            contact_address: { type: 'string', example: '123 Main St, Lagos, Nigeria' },
            approval_status: { type: 'string', enum: ['approved', 'pending', 'declined'], example: 'pending' },
            approved_on: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
            approved_by: { type: 'string', example: 'admin-user-id' },
            zip_code: { type: 'string', example: '100001' },
            created_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
            updated_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
          }
        },
        AccessRecord: {
          type: 'object',
          required: ['access_code', 'date_in', 'access_type'],
          properties: {
            access_code: { type: 'string', example: 'Dog47' },
            date_in: { type: 'string', format: 'date', example: '2024-01-15' },
            date_out: { type: 'string', format: 'date', example: '2024-01-15' },
            access_type: { type: 'string', enum: ['guest', 'resident', 'staff', 'delivery', 'maintenance', 'security', 'domestic_staff', 'service', 'others'], example: 'domestic_staff' },
            is_multi_entry: { type: 'boolean', example: true },
            max_entries: { type: 'number', example: 5 },
            resident_id: { type: 'string' },
            remarks: { type: 'string', example: 'Birthday party guest' },
            access_direction: { type: 'string', enum: ['entry', 'exit', 'both'], example: 'entry', default: 'entry', description: 'Direction the access code is valid for' }
          }
        },
        PhoneVerification: {
          type: 'object',
          required: ['phone'],
          properties: {
            phone: { type: 'string', example: '08065876770', description: 'Phone number to verify' }
          }
        },
        OTPVerification: {
          type: 'object',
          required: ['phone', 'otp'],
          properties: {
            phone: { type: 'string', example: '08065876770', description: 'Phone number used when requesting the OTP' },
            otp: { type: 'string', example: '123456', description: '6-digit OTP code' }
          }
        },
        PasswordResetRequest: {
          type: 'object',
          required: ['token', 'password'],
          properties: {
            token: { type: 'string', example: 'reset-token-from-email' },
            password: {
              type: 'string',
              example: 'NewSecurePass123!',
              description: 'New password to set for the account'
            }
          }
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['current_password', 'new_password'],
          properties: {
            current_password: { type: 'string', example: 'OldPass123!' },
            new_password: { type: 'string', example: 'NewSecurePass123!' }
          }
        },
        EmailVerificationRequest: {
          type: 'object',
          required: ['email', 'code'],
          properties: {
            email: { type: 'string', format: 'email', example: 'steve@example.com' },
            code: { type: 'string', example: '123456' }
          }
        },
        GoogleLinkRequest: {
          type: 'object',
          required: ['google_code'],
          properties: {
            google_code: {
              type: 'string',
              example: '4/0AVMBsJi-example-google-auth-code',
              description: 'Authorization code returned by Google OAuth'
            }
          }
        },
        OTPResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'OTP sent successfully' },
            expiresIn: { type: 'string', example: '10 minutes' }
          }
        },
        VerificationResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Phone verified successfully' },
            verified: { type: 'boolean', example: true }
          }
        },
        EstateListResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string', example: 'Pending estates retrieved successfully' },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Estate'
              }
            }
          }
        },
        EstateApprovalResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'success' },
            message: { type: 'string', example: 'Estate approved successfully' },
            data: {
              $ref: '#/components/schemas/Estate'
            }
          }
        },
        EstateSearchResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Estate found' },
            data: {
              $ref: '#/components/schemas/Estate'
            }
          }
        },
        EstateLinkingRequest: {
          type: 'object',
          required: ['estate_code'],
          properties: {
            estate_code: { type: 'string', example: 'EST123456', description: 'Estate code to link user to' }
          }
        },
        EstateLinkingResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'User linked to estate successfully' },
            data: {
              type: 'object',
              properties: {
                estate: {
                  $ref: '#/components/schemas/Estate'
                }
              }
            }
          }
        },
        InvitationValidationResponse: {
          type: 'object',
          properties: {
            valid: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Invitation is valid' },
            estate: {
              $ref: '#/components/schemas/Estate'
            }
          }
        },
        InvitationLinkResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            link: { type: 'string', example: 'lockwise://register?invite=eyJlc3RhdGVfaWQiOiI...' },
            message: { type: 'string', example: 'Invitation link generated successfully' }
          }
        },
        BulkInvitationRequest: {
          type: 'object',
          required: ['emails'],
          properties: {
            emails: { 
              type: 'array',
              items: { type: 'string', format: 'email' },
              example: ['resident1@example.com', 'resident2@example.com'],
              description: 'Array of email addresses to invite'
            }
          }
        },
        ResendInvitationRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { 
              type: 'string', 
              format: 'email', 
              example: 'resident@example.com',
              description: 'Email address to resend invitation to'
            }
          }
        },
        ValidateInvitationRequest: {
          type: 'object',
          required: ['token'],
          properties: {
            token: { type: 'string', example: 'eyJlc3RhdGVfaWQiOiI...' }
          }
        },
        BulkInvitationResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Invitation emails processed' },
            invited: { type: 'number', example: 3 },
            failed: { type: 'number', example: 0 },
            links: { 
              type: 'array',
              items: { type: 'string' },
              example: ['lockwise://register?invite=link1', 'lockwise://register?invite=link2']
            }
          }
        },
        SupportTicket: {
          type: 'object',
          required: ['subject', 'description', 'priority'],
          properties: {
            subject: { type: 'string', example: 'Access code not working' },
            description: { type: 'string', example: 'I cannot use my access code to enter the estate' },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], example: 'medium' },
            category: { type: 'string', enum: ['access', 'payment', 'technical', 'general'], example: 'access' }
          }
        },
        Amenity: {
          type: 'object',
          required: ['name', 'type'],
          properties: {
            name: { type: 'string', example: 'Swimming Pool' },
            type: { type: 'string', enum: ['pool', 'gym', 'hall', 'court', 'other'], example: 'pool' },
            description: { type: 'string', example: 'Olympic size swimming pool' },
            capacity: { type: 'number', example: 50 },
            operating_hours: { type: 'string', example: '6:00 AM - 10:00 PM' },
            booking_required: { type: 'boolean', example: true },
            fee_per_hour: { type: 'number', example: 1000 }
          }
        },
        CommunityPost: {
          type: 'object',
          required: ['title', 'content', 'type'],
          properties: {
            title: { type: 'string', example: 'Community Meeting' },
            content: { type: 'string', example: 'Monthly community meeting scheduled for next week' },
            type: { type: 'string', enum: ['announcement', 'discussion', 'event'], example: 'announcement' },
            is_pinned: { type: 'boolean', example: false }
          }
        },
        FAQ: {
          type: 'object',
          required: ['question', 'answer', 'category'],
          properties: {
            question: { type: 'string', example: 'How do I reset my password?' },
            answer: { type: 'string', example: 'Click on Forgot Password on the login page' },
            category: { type: 'string', enum: ['general', 'access_codes', 'payments', 'security', 'technical'], example: 'general' },
            order_index: { type: 'number', example: 1 }
          }
        },
        Plan: {
          type: 'object',
          required: ['name', 'price', 'duration'],
          properties: {
            name: { type: 'string', example: 'Basic Plan' },
            description: { type: 'string', example: 'Basic features for small estates' },
            price: { type: 'number', example: 10000 },
            currency: { type: 'string', example: 'NGN' },
            duration: { type: 'string', enum: ['monthly', 'yearly'], example: 'monthly' },
            features: { type: 'array', items: { type: 'string' }, example: ['Access Control', 'Basic Analytics'] }
          }
        },
        Referral: {
          type: 'object',
          required: ['name', 'email', 'phone'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            phone: { type: 'string', example: '+2348012345678' },
            referral_code: { type: 'string', example: 'REF123' },
            commission_rate: { type: 'number', example: 10 }
          }
        },
        ReferrerRegistrationRequest: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            phone: { type: 'string', example: '08012345678', description: 'Optional Nigerian phone number' }
          }
        },
        Address: {
          type: 'object',
          required: ['apartment_number', 'estate_id'],
          properties: {
            apartment_number: { type: 'string', example: 'A101' },
            block: { type: 'string', example: 'Block A' },
            street: { type: 'string', example: 'Main Street' },
            estate_id: { type: 'string' },
            latitude: { type: 'number', example: 6.5244 },
            longitude: { type: 'number', example: 3.3792 }
          }
        },
        AddressObject: {
          type: 'object',
          properties: {
            number: { type: 'string', example: '12B', description: 'Plot/House number' },
            street: { type: 'string', example: 'Palm Avenue', description: 'Street name' },
            city: { type: 'string', example: 'Lekki', description: 'City name' },
            country: { type: 'string', example: 'Nigeria', description: 'Country name' }
          }
        },
        EstateCreationRequest: {
          type: 'object',
          required: ['name', 'type'],
          properties: {
            name: { type: 'string', example: 'Greenfield Estate' },
            address: { $ref: '#/components/schemas/AddressObject' },
            type: { type: 'string', enum: ['residential', 'commercial', 'mixed', 'other'], example: 'residential' },
            state: { type: 'string', example: 'Lagos', description: 'State name (optional, defaults to city if not provided)' },
            country: { type: 'string', example: 'Nigeria', description: 'Country name' },
            country_code: { type: 'string', example: 'NG', description: 'ISO country code (2 letters)', default: 'NG' },
            timezone: { type: 'string', example: 'Africa/Lagos', description: 'Timezone identifier', default: 'Africa/Lagos' },
            currency_code: { type: 'string', example: 'NGN', description: 'ISO currency code (3 letters)', default: 'NGN' },
            number_of_appartments: { type: 'number', example: 120, description: 'Total number of apartments' },
            total_number_of_floors: { type: 'number', example: 6, description: 'Total number of floors' },
            postal_code: { type: 'string', example: '100001', description: 'Postal/ZIP code' },
            plus_code: { type: 'string', example: '6FRW+C2 Lagos, Nigeria', description: 'Google Plus Code' },
            digital_address: { type: 'string', example: 'GA-123-4567', description: 'Digital address (Ghana specific)' },
            landmark: { type: 'string', example: 'Near Central Park', description: 'Landmark for easier location identification' },
            coordinates: {
              type: 'object',
              properties: {
                lat: { type: 'number', example: 6.4572, description: 'Latitude coordinate' },
                lng: { type: 'number', example: 3.3928, description: 'Longitude coordinate' }
              },
              description: 'Geographic coordinates (both lat and lng required if provided)'
            },
            access_points: {
              type: 'array',
              items: {
                type: 'object',
                required: ['gate_name', 'type'],
                properties: {
                  gate_name: { type: 'string', example: 'Main Entrance', description: 'Name of the access point/gate' },
                  type: { type: 'string', example: 'vehicle', description: 'Type of access point' },
                  is_active: { type: 'boolean', example: true, description: 'Whether the access point is active', default: true }
                }
              },
              description: 'List of estate access points/gates'
            },
            geo_fencing: {
              type: 'object',
              properties: {
                center: {
                  type: 'object',
                  properties: {
                    lat: { type: 'number', example: 6.4572, description: 'Center latitude' },
                    lng: { type: 'number', example: 3.3928, description: 'Center longitude' }
                  },
                  description: 'Center coordinates for geofencing (both required if provided)'
                },
                radius_meters: { type: 'number', example: 500, description: 'Radius in meters for geofencing' }
              },
              description: 'Geofencing configuration (requires complete center coordinates)'
            },
            contact_phone: { type: 'string', example: '08012345678' },
            contact_email: { type: 'string', format: 'email', example: 'estatemanager@mailinator.com' },
            contact_address: { $ref: '#/components/schemas/AddressObject' },
            referral_code: { type: 'string', example: 'REF123', description: 'Referral code (optional)' }
          }
        },
        EstateUpdateRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Updated Estate Name' },
            type: { type: 'string', enum: ['residential', 'commercial', 'mixed', 'other'], example: 'residential' },
            state: { type: 'string', example: 'Lagos' },
            country: { type: 'string', example: 'Nigeria' },
            timezone: { type: 'string', example: 'Africa/Lagos' },
            currency_code: { type: 'string', example: 'NGN' },
            number_of_appartments: { type: 'number', example: 150 },
            total_number_of_floors: { type: 'number', example: 8 },
            contact_phone: { type: 'string', example: '08012345678' },
            contact_email: { type: 'string', format: 'email', example: 'manager@example.com' },
            contact_address: { type: 'string', example: '12 Palm Avenue, Lekki' }
          }
        },
        Notification: {
          type: 'object',
          required: ['title', 'message', 'type'],
          properties: {
            title: { type: 'string', example: 'Access Granted' },
            message: { type: 'string', example: 'Your visitor has been granted access' },
            type: { type: 'string', enum: ['info', 'warning', 'success', 'error'], example: 'success' },
            recipient_type: { type: 'string', enum: ['user', 'estate', 'all'], example: 'user' }
          }
        },
        ParkingSlot: {
          type: 'object',
          required: ['slot_number', 'type'],
          properties: {
            slot_number: { type: 'string', example: 'P001' },
            type: { type: 'string', enum: ['resident', 'guest', 'ev_charging'], example: 'resident' },
            is_occupied: { type: 'boolean', example: false },
            hourly_rate: { type: 'number', example: 200 }
          }
        },
        NotificationPreferences: {
          type: 'object',
          properties: {
            push_notifications: { type: 'boolean', example: true },
            email_notifications: { type: 'boolean', example: true },
            sms_notifications: { type: 'boolean', example: true },
            guest_entrance: { type: 'boolean', example: true },
            emergency_alerts: { type: 'boolean', example: true },
            system_updates: { type: 'boolean', example: true },
            payment_reminders: { type: 'boolean', example: true }
          }
        },
        DeviceRegistrationRequest: {
          type: 'object',
          required: ['fcmToken'],
          properties: {
            fcmToken: { type: 'string', example: 'fcm-token-string', description: 'Firebase Cloud Messaging token' },
            deviceId: { type: 'string', example: 'iPhone14,2', description: 'Device model identifier' },
            platform: { type: 'string', enum: ['ios', 'android', 'mobile'], example: 'ios', default: 'mobile' },
            appVersion: { type: 'string', example: '1.2.0', description: 'App version string' }
          }
        },
        PushTestRequest: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Test Notification', default: 'Test Notification' },
            body: { type: 'string', example: 'This is a test push notification from Lockwise', default: 'This is a test push notification from Lockwise' },
            data: { type: 'object', example: { key: 'value' }, description: 'Additional data payload' }
          }
        }
      }
    },
    paths: {
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
            '201': {
              description: 'User registered successfully'
            },
            '400': {
              description: 'Invalid request payload',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
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
                schema: {
                  $ref: '#/components/schemas/LoginRequest'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/LoginResponse'
                  }
                }
              }
            },
            '400': {
              description: 'Invalid request payload',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/auth/password/request': {
        post: {
          tags: ['Authentication'],
          summary: 'Request password reset',
          description: 'Send a password reset email to the supplied address.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'steve@example.com' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Password reset email requested'
            },
            '400': {
              description: 'Invalid request payload',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/auth/password/reset': {
        post: {
          tags: ['Authentication'],
          summary: 'Reset password',
          description: 'Reset password with the token from the password reset email.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PasswordResetRequest'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Password reset successfully'
            },
            '400': {
              description: 'Invalid token or password payload',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/auth/password/change': {
        post: {
          tags: ['Authentication'],
          summary: 'Change password',
          description: 'Change the authenticated user password.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ChangePasswordRequest'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Password changed successfully'
            },
            '400': {
              description: 'Invalid request payload',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/auth/email/send-code': {
        post: {
          tags: ['Authentication'],
          summary: 'Send email verification code',
          description: 'Send a verification code to the provided email address.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'steve@example.com' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Verification code sent'
            },
            '400': {
              description: 'Invalid request payload',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/auth/email/verify-code': {
        post: {
          tags: ['Authentication'],
          summary: 'Verify email code',
          description: 'Verify the email verification code for an address.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/EmailVerificationRequest'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Email verified successfully'
            },
            '400': {
              description: 'Invalid request payload',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/auth/google/google/link': {
        post: {
          tags: ['Authentication'],
          summary: 'Link Google account',
          description: 'Link an authenticated user account with Google using a Google authorization code.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/GoogleLinkRequest'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Google account linked successfully'
            },
            '400': {
              description: 'Invalid request payload',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/auth/phone/send-otp': {
        post: {
          tags: ['Authentication'],
          summary: 'Send OTP for phone verification',
          description: 'Send a 6-digit OTP code to the provided phone number for verification purposes',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PhoneVerification'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'OTP sent successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/OTPResponse'
                  }
                }
              }
            },
            '400': {
              description: 'Bad request - phone number required',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/auth/phone/verify-otp': {
        post: {
          tags: ['Authentication'],
          summary: 'Verify OTP for phone verification',
          description: 'Verify the 6-digit OTP code sent to the phone number',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/OTPVerification'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Phone verified successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/VerificationResponse'
                  }
                }
              }
            },
            '400': {
              description: 'Bad request - invalid or expired OTP',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/estate/register': {
        post: {
          tags: ['Estates'],
          summary: 'Create estate',
          description: 'Create a new estate as an authenticated manager.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/EstateCreationRequest'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Estate created successfully'
            },
            '400': {
              description: 'Invalid request payload',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Forbidden',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/estate/estates/pending': {
        get: {
          tags: ['Estates'],
          summary: 'Get pending estates',
          description: 'Retrieve all estates with pending approval status. Requires admin authentication.',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Pending estates retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/EstateListResponse'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - Invalid or missing authentication token',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Forbidden - Insufficient permissions (admin role required)',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/estate/estates/{estateId}/approve': {
        patch: {
          tags: ['Estates'],
          summary: 'Approve estate',
          description: 'Approve a pending estate registration. Requires admin authentication.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'estateId',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'ID of the estate to approve'
            }
          ],
          responses: {
            '200': {
              description: 'Estate approved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/EstateApprovalResponse'
                  }
                }
              }
            },
            '400': {
              description: 'Bad request - estate ID required',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - Invalid or missing authentication token',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Forbidden - Insufficient permissions (admin role required)',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Not found - Estate not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/estate/update/{estateId}': {
        put: {
          tags: ['Estates'],
          summary: 'Update estate',
          description: 'Update editable estate fields.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'estateId',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'ID of the estate to update'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/EstateUpdateRequest'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Estate updated successfully'
            },
            '400': {
              description: 'Invalid request payload',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Forbidden',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Estate not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/estate/search/{estate_code}': {
        get: {
          tags: ['Estates'],
          summary: 'Search estate by code',
          description: 'Search for an estate using its unique estate code',
          parameters: [
            {
              name: 'estate_code',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Unique estate code to search for'
            }
          ],
          responses: {
            '200': {
              description: 'Estate found successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/EstateSearchResponse'
                  }
                }
              }
            },
            '404': {
              description: 'Estate not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/estate/validate-invite': {
        post: {
          tags: ['Estates'],
          summary: 'Validate invitation token',
          description: 'Validate an estate invitation token supplied in the request body.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValidateInvitationRequest'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Invitation token validated'
            },
            '400': {
              description: 'Token is missing or invalid',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/user/link-estate': {
        post: {
          tags: ['Users'],
          summary: 'Link user to estate',
          description: 'Link authenticated user to an estate using estate code',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/EstateLinkingRequest'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'User linked to estate successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/EstateLinkingResponse'
                  }
                }
              }
            },
            '400': {
              description: 'Bad request - estate code required',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - Invalid or missing authentication token',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Estate not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/payment/initiate': {
        post: {
          tags: ['Payments'],
          summary: 'Initiate payment',
          description: 'Initiate a payment for the authenticated resident.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PaymentInitiation'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Payment initiated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/PaymentResponse'
                  }
                }
              }
            },
            '400': {
              description: 'Invalid request payload',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/payment/subscription': {
        post: {
          tags: ['Payments'],
          summary: 'Initiate subscription',
          description: 'Create a subscription checkout session for the authenticated manager.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SubscriptionInitiationRequest'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Subscription initiated successfully'
            },
            '400': {
              description: 'Invalid request payload',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/referral/register': {
        post: {
          tags: ['Referrals'],
          summary: 'Register referrer',
          description: 'Register a referrer record.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ReferrerRegistrationRequest'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Referrer registered successfully'
            },
            '400': {
              description: 'Invalid request payload',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/estate/invitations/validate/{token}': {
        get: {
          tags: ['Estates'],
          summary: 'Validate estate invitation',
          description: 'Validate an estate invitation token',
          parameters: [
            {
              name: 'token',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Invitation token to validate'
            }
          ],
          responses: {
            '200': {
              description: 'Invitation validated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/InvitationValidationResponse'
                  }
                }
              }
            },
            '400': {
              description: 'Bad request - token required',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '404': {
              description: 'Invitation not found or expired',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/estate/invite/{estateId}': {
        post: {
          tags: ['Estates'],
          summary: 'Generate estate invitation link',
          description: 'Generate a secure invitation link for estate residents. Requires manager authentication and estate association.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'estateId',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'ID of the estate to generate invitation for'
            }
          ],
          responses: {
            '200': {
              description: 'Invitation link generated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/InvitationLinkResponse'
                  }
                }
              }
            },
            '400': {
              description: 'Bad request - estate not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - authentication required',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Forbidden - manager role required or not linked to estate',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/estate/residents/bulk-invite': {
        post: {
          tags: ['Estates'],
          summary: 'Send bulk estate invitations',
          description: 'Send invitation emails to multiple residents at once. Requires manager authentication and estate association.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/BulkInvitationRequest'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Bulk invitations processed successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/BulkInvitationResponse'
                  }
                }
              }
            },
            '400': {
              description: 'Bad request - invalid email array',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - authentication required',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Forbidden - manager role required or not linked to estate',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      },
      '/notifications/preferences': {
        get: {
          tags: ['Notifications'],
          summary: 'Get notification preferences',
          description: 'Retrieve the authenticated user notification preferences.',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Preferences retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data: { $ref: '#/components/schemas/NotificationPreferences' }
                    }
                  }
                }
              }
            },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '500': { description: 'Internal server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        },
        put: {
          tags: ['Notifications'],
          summary: 'Update notification preferences',
          description: 'Update one or more notification preference flags for the authenticated user.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/NotificationPreferences' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Preferences updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data: { $ref: '#/components/schemas/NotificationPreferences' }
                    }
                  }
                }
              }
            },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '500': { description: 'Internal server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/mobile/device/register': {
        post: {
          tags: ['Mobile'],
          summary: 'Register device',
          description: 'Register or update a mobile device for push notifications via FCM.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DeviceRegistrationRequest' }
              }
            }
          },
          responses: {
            '200': { description: 'Device registered successfully' },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '500': { description: 'Internal server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        },
        delete: {
          tags: ['Mobile'],
          summary: 'Unregister device',
          description: 'Remove all registered devices for the authenticated user.',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Device unregistered successfully' },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '500': { description: 'Internal server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/mobile/push/test': {
        post: {
          tags: ['Mobile'],
          summary: 'Send test push notification',
          description: 'Send a test push notification to the authenticated user registered devices.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PushTestRequest' }
              }
            }
          },
          responses: {
            '200': { description: 'Test push notification sent' },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '500': { description: 'Internal server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/address/estates/{estate_id}/streets': {
        get: {
          tags: ['Location'],
          summary: 'List streets for an estate',
          description: 'Returns all streets in the estate, optionally filtered by name. Each street includes an `id` alias for `street_id`.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'estate_id', in: 'path', required: true, schema: { type: 'string', example: '8e9ab13d-9d0a-4d22-9d12-3273ce36601f' }, description: 'Estate UUID' },
            { name: 'search', in: 'query', required: false, schema: { type: 'string', example: 'Main' }, description: 'Case-insensitive substring match on street name' }
          ],
          responses: {
            '200': { description: 'Streets retrieved', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'success' }, data: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, street_id: { type: 'string' }, name: { type: 'string', example: 'Main Street' }, estate_id: { type: 'string' } } } } } } } } },
            '401': { description: 'Unauthorized' }
          }
        },
        post: {
          tags: ['Location'],
          summary: 'Create a street in an estate',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'estate_id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string', example: 'Acacia Avenue' } } } } } },
          responses: {
            '201': { description: 'Street created' },
            '401': { description: 'Unauthorized' }
          }
        }
      },
      '/address/streets/{street_id}/units': {
        get: {
          tags: ['Location'],
          summary: 'List units on a street',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'street_id', in: 'path', required: true, schema: { type: 'string', example: 'street-uuid-here' }, description: 'Street UUID (use `id` from street response)' }
          ],
          responses: {
            '200': { description: 'Units retrieved', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'success' }, data: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, unit_identifier: { type: 'string', example: 'A101' }, block: { type: 'string', example: 'A' }, floor: { type: 'integer', example: 1 }, unit_type: { type: 'string', example: 'flat' }, status: { type: 'string', example: 'vacant' }, street: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } } } } } } } } } } },
            '401': { description: 'Unauthorized' }
          }
        },
        post: {
          tags: ['Location'],
          summary: 'Create a unit on a street',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'street_id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['unit_identifier'], properties: { unit_identifier: { type: 'string', example: 'A101' }, block: { type: 'string', example: 'A' }, floor: { type: 'integer', example: 1 }, unit_type: { type: 'string', enum: ['flat', 'duplex', 'chalet', 'terrace', 'plot', 'house', 'apartment', 'other'], example: 'flat' } } } } } },
          responses: {
            '201': { description: 'Unit created' },
            '401': { description: 'Unauthorized' }
          }
        }
      },
      '/address/estates/{estate_id}/units': {
        get: {
          tags: ['Location'],
          summary: 'Search units across an estate',
          description: 'Searches all units in the estate. Filter by unit identifier or street_id.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'estate_id', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'search', in: 'query', required: false, schema: { type: 'string', example: 'A1' } },
            { name: 'street_id', in: 'query', required: false, schema: { type: 'string' } }
          ],
          responses: {
            '200': { description: 'Units retrieved' },
            '401': { description: 'Unauthorized' }
          }
        }
      },
      '/estate/{estateId}/gates': {
        get: {
          tags: ['Estates'],
          summary: 'List gates for an estate',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'estateId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Gates retrieved' }, '401': { description: 'Unauthorized' } }
        },
        post: {
          tags: ['Estates'],
          summary: 'Create a gate for an estate',
          description: 'gate_code is auto-generated server-side. Do not include it in the request.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'estateId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['gate_name', 'gate_type', 'access_control_type'], properties: { gate_name: { type: 'string', example: 'Main Entrance' }, gate_type: { type: 'string', enum: ['main', 'service', 'pedestrian', 'emergency', 'vip'], example: 'main' }, access_control_type: { type: 'string', enum: ['manual', 'rfid', 'biometric', 'qr_code', 'hybrid'], example: 'qr_code' }, is_active: { type: 'boolean', example: true, default: true } } } } }
          },
          responses: { '201': { description: 'Gate created' }, '401': { description: 'Unauthorized' } }
        }
      },
      '/estate/{estateId}/onboarding-step': {
        patch: {
          tags: ['Estates'],
          summary: 'Update estate onboarding step',
          description: 'Advance the wizard step. Pass `status: "pending"` on the final step to submit the estate for admin review.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'estateId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['step'], properties: { step: { type: 'integer', example: 2, description: 'Onboarding wizard step number' }, status: { type: 'string', enum: ['pending'], example: 'pending', description: 'Pass "pending" on final step to trigger admin review' } } } } } },
          responses: { '200': { description: 'Onboarding step updated' }, '401': { description: 'Unauthorized' } }
        }
      },
      '/estate/{estateId}/logo': {
        patch: {
          tags: ['Estates'],
          summary: 'Upload estate logo',
          description: 'Upload or replace the estate logo image. Requires manager ownership of the estate.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'estateId', in: 'path', required: true, schema: { type: 'string' }, description: 'Estate UUID' }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['logo'],
                  properties: {
                    logo: { type: 'string', format: 'binary', description: 'Logo image file (jpg, png, webp)' }
                  }
                }
              }
            }
          },
          responses: {
            '200': { description: 'Logo uploaded', content: { 'application/json': { schema: { type: 'object', properties: { logo_url: { type: 'string', example: 'https://cdn.example.com/logos/abc.png' } } } } } },
            '401': { description: 'Unauthorized' },
            '403': { description: 'Forbidden — not estate owner or admin' }
          }
        }
      },
      '/estate/estates/pending-updates': {
        get: {
          tags: ['Estates'],
          summary: 'List estates with pending manager update requests (Admin)',
          description: 'Returns all estates where a manager has submitted field changes awaiting admin approval.',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'List of estates with pending_update_data', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Estate' } } } } } } },
            '401': { description: 'Unauthorized' },
            '403': { description: 'Admin role required' }
          }
        }
      },
      '/estate/{estateId}/apply-update': {
        post: {
          tags: ['Estates'],
          summary: 'Approve or reject a pending estate update (Admin)',
          description: 'Admin approves or rejects staged estate field changes from a manager. On approval the changes are applied immediately; on rejection `pending_update_data` is cleared.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'estateId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['approved'],
                  properties: {
                    approved: { type: 'boolean', example: true },
                    rejection_reason: { type: 'string', example: 'Invalid address format' }
                  }
                }
              }
            }
          },
          responses: {
            '200': { description: 'Update applied or rejected' },
            '401': { description: 'Unauthorized' },
            '403': { description: 'Admin role required' },
            '404': { description: 'Estate not found' }
          }
        }
      },
      '/estate/{estateId}/setup-checklist': {
        patch: {
          tags: ['Estates'],
          summary: 'Update estate setup checklist',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'estateId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { gates_configured: { type: 'boolean', example: true }, residents_invited: { type: 'boolean', example: true } } } } } },
          responses: { '200': { description: 'Checklist updated' }, '401': { description: 'Unauthorized' } }
        }
      },
      '/bulk-upload/streets-units': {
        post: {
          tags: ['Upload'],
          summary: 'Bulk upload streets and units',
          description: 'Upload a CSV or Excel file to populate streets and units for an estate. Rows with duplicate unit identifiers on the same street are skipped (idempotent). Managers can only upload to their own estate.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['file', 'estateId'],
                  properties: {
                    file: { type: 'string', format: 'binary', description: 'CSV, XLSX, or XLS file' },
                    estateId: { type: 'string', example: '8e9ab13d-9d0a-4d22-9d12-3273ce36601f', description: 'Estate to upload streets/units into' }
                  }
                }
              }
            }
          },
          responses: {
            '200': { description: 'Upload completed', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'success' }, data: { type: 'object', properties: { totalProcessed: { type: 'integer' }, successCount: { type: 'integer' }, streetsCreated: { type: 'integer' }, unitsCreated: { type: 'integer' }, skippedCount: { type: 'integer' }, errorCount: { type: 'integer' }, errors: { type: 'array', items: { type: 'object', properties: { row: { type: 'integer' }, reason: { type: 'string' } } } } } } } } } } },
            '400': { description: 'No file, missing estateId, or invalid format' },
            '401': { description: 'Unauthorized' },
            '403': { description: 'Forbidden — manager uploading to another estate' }
          }
        }
      },
      '/bulk-upload/template/{type}': {
        get: {
          tags: ['Upload'],
          summary: 'Get upload template',
          description: 'Returns column headers, sample data, and instructions for the given upload type.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'type', in: 'path', required: true, schema: { type: 'string', enum: ['estates', 'residents', 'addresses', 'streets-units'] }, description: 'Template type' }
          ],
          responses: {
            '200': { description: 'Template info returned' },
            '400': { description: 'Invalid type' }
          }
        }
      },
      '/access/scan': {
        post: {
          tags: ['Access Control'],
          summary: 'Scan / process an access code',
          description: 'Security scans a guest access code at the gate. For single-entry codes the status becomes `used` after one scan. For multi-entry codes `used_entries` is incremented; status becomes `used` when `max_entries` is reached.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['code'], properties: { code: { type: 'string', example: 'Dog47', description: 'The access code string to validate' }, gate_id: { type: 'string', description: 'Optional gate UUID where the scan occurs' }, scanned_by: { type: 'string', description: 'Optional user ID of the security staff scanning' } } } } }
          },
          responses: {
            '200': { description: 'Access granted — entry recorded' },
            '400': { description: 'Access code invalid, expired, or entries exhausted' },
            '401': { description: 'Unauthorized' }
          }
        }
      },
      '/estate/residents/approvals': {
        get: {
          tags: ['Estates'],
          summary: 'Get pending resident approvals',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Pending approvals list returned' }, '401': { description: 'Unauthorized' } }
        }
      },
      '/estate/residents/approvals/{residentId}/approve': {
        patch: {
          tags: ['Estates'],
          summary: 'Approve a resident',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'residentId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Resident approved' }, '401': { description: 'Unauthorized' } }
        }
      },
      '/estate/residents/approvals/{residentId}/decline': {
        patch: {
          tags: ['Estates'],
          summary: 'Decline a resident',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'residentId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Resident declined' }, '401': { description: 'Unauthorized' } }
        }
      },
      '/plan': {
        get: {
          tags: ['Plans'],
          summary: 'Get all subscription plans',
          description: 'Public — no auth required.',
          responses: { '200': { description: 'Plans returned' } }
        }
      },
      '/push/vapid-public-key': {
        get: {
          tags: ['Mobile'],
          summary: 'Get VAPID public key for web push',
          description: 'No auth required. Used by service workers to subscribe to push notifications.',
          responses: { '200': { description: 'VAPID public key string returned' } }
        }
      },
      '/push/subscribe': {
        post: {
          tags: ['Mobile'],
          summary: 'Subscribe to web push',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', description: 'PushSubscription object from browser Notification API' } } } },
          responses: { '200': { description: 'Subscription saved' }, '401': { description: 'Unauthorized' } }
        }
      },
      '/push/unsubscribe': {
        delete: {
          tags: ['Mobile'],
          summary: 'Unsubscribe from web push',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Subscription removed' }, '401': { description: 'Unauthorized' } }
        }
      },
      '/emergency/location-contacts': {
        get: {
          tags: ['Emergency'],
          summary: 'Get location-based emergency contacts',
          description: "Returns emergency contacts scoped to the user's country, state, and city - grouped by category and annotated with scope badge (Local/State/National).",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'countryId', in: 'query', required: true, schema: { type: 'string' }, description: 'Country UUID' },
            { name: 'stateId', in: 'query', schema: { type: 'string' }, description: 'State UUID (optional)' },
            { name: 'cityId', in: 'query', schema: { type: 'string' }, description: 'City UUID (optional)' }
          ],
          responses: {
            '200': { description: 'Emergency contacts grouped by category', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { type: 'object', properties: { category: { type: 'string', example: 'Police' }, icon: { type: 'string', example: 'shield-account' }, contacts: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, phone_number: { type: 'string' }, scope: { type: 'string', enum: ['Local', 'State', 'National'] } } } } } } } } } } },
            '401': { description: 'Unauthorized' }
          }
        }
      },
      '/emergency/location-contacts/countries': {
        get: {
          tags: ['Emergency'],
          summary: 'List countries for emergency contact selectors',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Countries list' } }
        }
      },
      '/emergency/location-contacts/countries/{countryId}/states': {
        get: {
          tags: ['Emergency'],
          summary: 'List states for a country',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'countryId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'States list' } }
        }
      },
      '/emergency/location-contacts/states/{stateId}/cities': {
        get: {
          tags: ['Emergency'],
          summary: 'List cities for a state',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'stateId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Cities list' } }
        }
      },
      '/emergency/location-contacts/categories': {
        get: {
          tags: ['Emergency'],
          summary: 'List emergency contact categories',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Categories list' } }
        }
      },
      '/emergency/location-contacts/admin': {
        get: {
          tags: ['Emergency'],
          summary: 'Admin — list all location emergency contacts',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'All contacts' }, '403': { description: 'Admin role required' } }
        },
        post: {
          tags: ['Emergency'],
          summary: 'Admin — create a location emergency contact',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['category_id', 'name', 'phone_number', 'country_id'],
                  properties: {
                    category_id: { type: 'string' },
                    name: { type: 'string', example: 'Lagos State Fire Service' },
                    phone_number: { type: 'string', example: '0800-FIRE' },
                    alt_phone_number: { type: 'string' },
                    country_id: { type: 'string' },
                    state_id: { type: 'string' },
                    city_id: { type: 'string' },
                    description: { type: 'string' },
                    is_active: { type: 'boolean', default: true },
                    priority: { type: 'integer', default: 100 }
                  }
                }
              }
            }
          },
          responses: { '201': { description: 'Contact created' }, '403': { description: 'Admin role required' } }
        }
      },
      '/emergency/location-contacts/admin/{contactId}': {
        put: {
          tags: ['Emergency'],
          summary: 'Admin — update a location emergency contact',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'contactId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '200': { description: 'Contact updated' }, '403': { description: 'Admin role required' }, '404': { description: 'Not found' } }
        },
        delete: {
          tags: ['Emergency'],
          summary: 'Admin — delete a location emergency contact',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'contactId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Contact deleted' }, '403': { description: 'Admin role required' }, '404': { description: 'Not found' } }
        }
      },
      '/wallet/account': {
        get: {
          tags: ['Wallet'],
          summary: 'Get wallet account details',
          description: "Returns the authenticated resident's wallet account info including virtual account number if provisioned.",
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Wallet account details', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'object', properties: { id: { type: 'string' }, balance: { type: 'number', example: 5000 }, currency: { type: 'string', example: 'NGN' }, kuda_account_number: { type: 'string', nullable: true }, kuda_account_name: { type: 'string', nullable: true } } } } } } } },
            '401': { description: 'Unauthorized' }
          }
        }
      },
      '/collections/fees': {
        get: {
          tags: ['Collections'],
          summary: 'Get estate fees',
          description: 'Returns all fees defined for the estate. Any authenticated user in the estate can list fees.',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Fee list', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { type: 'object', properties: { fee_id: { type: 'string' }, name: { type: 'string', example: 'Monthly Service Charge' }, amount: { type: 'number', example: 5000 }, frequency: { type: 'string', enum: ['monthly', 'quarterly', 'annually', 'one_time'] }, is_active: { type: 'boolean' } } } } } } } } },
            '401': { description: 'Unauthorized' }
          }
        },
        post: {
          tags: ['Collections'],
          summary: 'Create a fee (Manager)',
          description: 'Define a new recurring or one-time fee for residents in the estate.',
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
                    resident_ids: { type: 'array', items: { type: 'string' }, description: 'Optional subset of residents; omit to target all' }
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
          description: 'Returns all invoices for the authenticated resident.',
          security: [{ bearerAuth: [] }],
          responses: { '200': { description: 'Invoice list' }, '401': { description: 'Unauthorized' } }
        }
      },
      '/collections/invoices/{invoiceId}/pay': {
        post: {
          tags: ['Collections'],
          summary: 'Pay an invoice',
          description: 'Initiate payment for a specific invoice. Triggers Paystack payment flow.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'invoiceId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Payment initiated', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaymentResponse' } } } }, '404': { description: 'Invoice not found' } }
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
          description: 'Returns aggregate collection statistics — total billed, collected, outstanding, and waived — for the estate.',
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
                schema: {
                  type: 'object',
                  required: ['amount'],
                  properties: {
                    amount: { type: 'number', example: 50000 },
                    note: { type: 'string' }
                  }
                }
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
      },
      '/kuda/estate-wallet/balance': {
        get: {
          tags: ['Kuda'],
          summary: 'Get estate virtual wallet balance (Manager)',
          description: 'Returns the Kuda-powered estate wallet balance. Returns 503 when `KUDA_API_KEY` is not configured.',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Estate wallet balance', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'object', properties: { balance: { type: 'number', example: 150000 }, currency: { type: 'string', example: 'NGN' }, kuda_account_number: { type: 'string', nullable: true } } } } } } } },
            '401': { description: 'Unauthorized' },
            '403': { description: 'Manager role required' },
            '503': { description: 'Kuda integration not configured' }
          }
        }
      },
      '/kuda/estate-wallet/provision': {
        post: {
          tags: ['Kuda'],
          summary: 'Provision a Kuda virtual account for the estate (Manager)',
          description: 'Creates a Kuda Business virtual sub-account linked to the estate. Idempotent — returns existing account if already provisioned.',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Virtual account provisioned or already exists', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'object', properties: { kuda_account_number: { type: 'string' }, kuda_account_name: { type: 'string' }, kuda_tracking_reference: { type: 'string' } } } } } } } },
            '403': { description: 'Manager role required' },
            '503': { description: 'Kuda integration not configured' }
          }
        }
      },
      '/kuda/estate-wallet/transactions': {
        get: {
          tags: ['Kuda'],
          summary: 'Get estate wallet transaction history (Manager)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } }
          ],
          responses: { '200': { description: 'Estate wallet transactions' }, '403': { description: 'Manager role required' } }
        }
      },
      '/kuda/webhook': {
        post: {
          tags: ['Kuda'],
          summary: 'Kuda webhook receiver',
          description: 'Receives inbound Kuda Business API webhooks (credit alerts for estate virtual accounts). No bearer auth — verified by Kuda signature.',
          responses: { '200': { description: 'Webhook processed' } }
        }
      },
      '/electricity/validate-meter': {
        post: {
          tags: ['Electricity'],
          summary: 'Validate a meter number',
          description: 'Validate a meter number against electricity distribution companies using multi-provider failover.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['meterNumber', 'disco', 'meterType'], properties: { meterNumber: { type: 'string', example: '12345678901' }, disco: { type: 'string', enum: ['EKEDC', 'IKEDC', 'JED', 'AEDC', 'PHED', 'EEDC', 'KEDCO', 'BEDC', 'KAEDCO', 'IBEDC'], example: 'EKEDC' }, meterType: { type: 'string', enum: ['prepaid', 'postpaid'], example: 'prepaid' } } } } }
          },
          responses: {
            '200': { description: 'Meter validation result', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { valid: { type: 'boolean' }, customerName: { type: 'string', example: 'John Doe' }, customerAddress: { type: 'string' }, meterNumber: { type: 'string' }, disco: { type: 'string' }, minimumAmount: { type: 'number' } } } } } } } },
            '400': { description: 'Invalid input', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '401': { description: 'Unauthorized' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/electricity/meters': {
        post: {
          tags: ['Electricity'],
          summary: 'Register a smart meter',
          description: 'Register and validate a smart meter for the authenticated resident. The meter is validated with providers before saving.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['meterNumber', 'disco', 'meterType'], properties: { meterNumber: { type: 'string', example: '12345678901' }, disco: { type: 'string', enum: ['EKEDC', 'IKEDC', 'JED', 'AEDC', 'PHED', 'EEDC', 'KEDCO', 'BEDC', 'KAEDCO', 'IBEDC'], example: 'EKEDC' }, meterType: { type: 'string', enum: ['prepaid', 'postpaid'], example: 'prepaid' } } } } }
          },
          responses: {
            '201': { description: 'Meter registered successfully' },
            '400': { description: 'Validation failed or meter already registered' },
            '401': { description: 'Unauthorized' }
          }
        },
        get: {
          tags: ['Electricity'],
          summary: 'Get my registered meters',
          description: 'Returns all smart meters registered by the authenticated user.',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'List of registered meters', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, meter_number: { type: 'string' }, disco: { type: 'string' }, meter_type: { type: 'string' }, customer_name: { type: 'string' }, auto_load_enabled: { type: 'boolean' }, is_verified: { type: 'boolean' } } } } } } } } },
            '401': { description: 'Unauthorized' }
          }
        }
      },
      '/electricity/meters/{meterId}/auto-load': {
        patch: {
          tags: ['Electricity'],
          summary: 'Toggle auto-load for a meter',
          description: 'Enable or disable automatic token loading for a registered smart meter. Meter must be verified.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'meterId', in: 'path', required: true, schema: { type: 'string' }, description: 'Smart meter UUID' }],
          responses: {
            '200': { description: 'Auto-load toggled', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { auto_load_enabled: { type: 'boolean' } } } } } } } },
            '400': { description: 'Meter not verified' },
            '401': { description: 'Unauthorized' },
            '404': { description: 'Meter not found' }
          }
        },
        post: {
          tags: ['Electricity'],
          summary: 'Auto-load electricity token',
          description: 'Vend electricity using a registered smart meter with auto-load enabled. Token is delivered automatically and receipt sent via email.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'meterId', in: 'path', required: true, schema: { type: 'string' }, description: 'Smart meter UUID' }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['amount'], properties: { amount: { type: 'number', example: 5000, description: 'Amount in Naira (minimum 500)' } } } } }
          },
          responses: {
            '200': { description: 'Token vended successfully', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { token: { type: 'string', example: '1234-5678-9012-3456-7890' }, units: { type: 'string', example: '50.5' }, reference: { type: 'string' }, provider: { type: 'string' }, status: { type: 'string' }, auto_loaded: { type: 'boolean', example: true } } } } } } } },
            '400': { description: 'Auto-load not enabled or amount too low' },
            '401': { description: 'Unauthorized' },
            '404': { description: 'Meter not found' },
            '502': { description: 'All providers failed' }
          }
        }
      },
      '/electricity/meters/{meterId}': {
        delete: {
          tags: ['Electricity'],
          summary: 'Delete a registered meter',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'meterId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': { description: 'Meter removed' },
            '401': { description: 'Unauthorized' },
            '404': { description: 'Meter not found' }
          }
        }
      },
      '/electricity/vend': {
        post: {
          tags: ['Electricity'],
          summary: 'Vend electricity token (manual)',
          description: 'Purchase electricity token for any meter number. Uses multi-provider failover (VTPass → BuyPower → Baxi). Receipt sent via email on success.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['meterNumber', 'disco', 'meterType', 'amount'], properties: { meterNumber: { type: 'string', example: '12345678901' }, disco: { type: 'string', enum: ['EKEDC', 'IKEDC', 'JED', 'AEDC', 'PHED', 'EEDC', 'KEDCO', 'BEDC', 'KAEDCO', 'IBEDC'], example: 'EKEDC' }, meterType: { type: 'string', enum: ['prepaid', 'postpaid'], example: 'prepaid' }, amount: { type: 'number', example: 5000, description: 'Amount in Naira (minimum 500)' } } } } }
          },
          responses: {
            '200': { description: 'Token vended successfully', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { token: { type: 'string', example: '1234-5678-9012-3456-7890' }, units: { type: 'string', example: '50.5' }, reference: { type: 'string' }, provider: { type: 'string', example: 'vtpass' }, status: { type: 'string', example: 'successful' } } } } } } } },
            '400': { description: 'Invalid input or amount below minimum' },
            '401': { description: 'Unauthorized' },
            '502': { description: 'All providers failed' }
          }
        }
      },
      '/electricity/requery': {
        post: {
          tags: ['Electricity'],
          summary: 'Requery a pending transaction',
          description: 'Check the status of a pending electricity transaction. Tries the original provider first, then falls back to others.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['reference'], properties: { reference: { type: 'string', example: 'LW_ELEC_xxxxxxxxxxxx_vtpass' }, provider: { type: 'string', example: 'vtpass', description: 'Original provider name (optional, improves lookup speed)' } } } } }
          },
          responses: {
            '200': { description: 'Requery result', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { status: { type: 'string', enum: ['successful', 'pending', 'failed'] }, token: { type: 'string' }, units: { type: 'string' }, reference: { type: 'string' } } } } } } } },
            '400': { description: 'Reference required' },
            '401': { description: 'Unauthorized' }
          }
        }
      },
      '/electricity/transactions': {
        get: {
          tags: ['Electricity'],
          summary: 'Get transaction history',
          description: 'Returns paginated electricity transaction history for the authenticated user.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 }, description: 'Number of records per page' },
            { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 }, description: 'Number of records to skip' }
          ],
          responses: {
            '200': { description: 'Transaction history', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { transactions: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, meter_number: { type: 'string' }, disco: { type: 'string' }, amount: { type: 'number' }, token: { type: 'string' }, units: { type: 'string' }, status: { type: 'string' }, provider: { type: 'string' }, auto_loaded: { type: 'boolean' }, created_at: { type: 'string', format: 'date-time' } } } }, total: { type: 'integer' } } } } } } } },
            '401': { description: 'Unauthorized' }
          }
        }
      },
      '/wallet/balance': {
        get: {
          tags: ['Wallet'],
          summary: 'Get wallet balance',
          description: 'Returns the current wallet balance for the authenticated user. Creates a wallet automatically if one does not exist.',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Wallet balance', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'success' }, data: { type: 'object', properties: { balance: { type: 'number', example: 15000.50 }, currency: { type: 'string', example: 'NGN' } } } } } } } },
            '401': { description: 'Unauthorized' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/wallet/fund': {
        post: {
          tags: ['Wallet'],
          summary: 'Fund wallet',
          description: 'Initiate a Paystack payment to fund the wallet. Returns an authorization URL to complete payment.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['amount'], properties: { amount: { type: 'number', example: 5000, description: 'Amount in Naira (minimum ₦100)' } } } } }
          },
          responses: {
            '200': { description: 'Payment initialized', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'success' }, data: { type: 'object', properties: { authorization_url: { type: 'string', example: 'https://checkout.paystack.com/abc123' }, reference: { type: 'string', example: 'wlt_1234567890_abc123' } } } } } } } },
            '400': { description: 'Amount below minimum (₦100)' },
            '401': { description: 'Unauthorized' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/wallet/verify': {
        post: {
          tags: ['Wallet'],
          summary: 'Verify wallet funding',
          description: 'Verify a Paystack payment and credit the wallet. Call this after the user completes payment on Paystack checkout.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['reference'], properties: { reference: { type: 'string', example: 'wlt_1234567890_abc123', description: 'Paystack payment reference from the fund endpoint' } } } } }
          },
          responses: {
            '200': { description: 'Wallet credited', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'success' }, data: { type: 'object', properties: { balance: { type: 'number', example: 20000.50 }, amount: { type: 'number', example: 5000 }, reference: { type: 'string' } } } } } } } },
            '400': { description: 'Reference missing or payment not successful' },
            '401': { description: 'Unauthorized' },
            '404': { description: 'Wallet not found' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/wallet/transactions': {
        get: {
          tags: ['Wallet'],
          summary: 'Get wallet transactions',
          description: 'Returns paginated wallet transaction history (credits, debits, refunds) for the authenticated user.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Number of records per page' },
            { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 }, description: 'Number of records to skip' }
          ],
          responses: {
            '200': { description: 'Transaction history', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'success' }, data: { type: 'object', properties: { transactions: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, type: { type: 'string', enum: ['credit', 'debit'] }, amount: { type: 'number', example: 5000 }, balance_before: { type: 'number' }, balance_after: { type: 'number' }, description: { type: 'string', example: 'Wallet funding via Paystack' }, category: { type: 'string', enum: ['funding', 'bill_payment', 'refund', 'transfer'] }, reference: { type: 'string' }, status: { type: 'string', enum: ['pending', 'success', 'failed'] }, created_at: { type: 'string', format: 'date-time' } } } }, total: { type: 'integer' } } } } } } } },
            '401': { description: 'Unauthorized' },
            '500': { description: 'Internal server error' }
          }
        }
      },
      '/bills/providers': {
        get: {
          tags: ['Bills'],
          summary: 'Get all bill providers',
          description: 'Returns all supported providers grouped by category (electricity, airtime, data, TV). No authentication required.',
          responses: {
            '200': { description: 'Provider list', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'success' }, data: { type: 'object', properties: { electricity: { type: 'object', example: { 'ikeja-electric': 'IKEDC - Ikeja Electric', 'eko-electric': 'EKEDC - Eko Electric' } }, airtime: { type: 'object', example: { 'mtn': 'MTN', 'glo': 'GLO', 'airtel': 'Airtel', 'etisalat': '9mobile' } }, data: { type: 'object', example: { 'mtn-data': 'MTN Data', 'glo-data': 'GLO Data' } }, tv: { type: 'object', example: { 'dstv': 'DSTV', 'gotv': 'GOtv', 'startimes': 'Startimes' } } } } } } } } }
          }
        }
      },
      '/bills/airtime/pay': {
        post: {
          tags: ['Bills'],
          summary: 'Purchase airtime',
          description: 'Buy airtime for any Nigerian network. Debits wallet if useWallet is true.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['serviceID', 'phone', 'amount'], properties: { serviceID: { type: 'string', enum: ['mtn', 'glo', 'airtel', 'etisalat'], example: 'mtn' }, phone: { type: 'string', example: '08012345678' }, amount: { type: 'number', example: 1000, description: 'Amount in Naira (minimum ₦50)' }, useWallet: { type: 'boolean', example: true, description: 'Debit from wallet balance' } } } } }
          },
          responses: {
            '201': { description: 'Airtime purchased successfully' },
            '400': { description: 'Invalid input, insufficient balance, or amount below minimum' },
            '401': { description: 'Unauthorized' },
            '500': { description: 'Provider error' }
          }
        }
      },
      '/bills/data/plans/{serviceID}': {
        get: {
          tags: ['Bills'],
          summary: 'Get data plans',
          description: 'Returns available data plans for a network provider.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'serviceID', in: 'path', required: true, schema: { type: 'string', enum: ['mtn-data', 'glo-data', 'airtel-data', 'etisalat-data'] }, description: 'Data provider service ID' }],
          responses: {
            '200': { description: 'Data plans list', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'success' }, data: { type: 'array', items: { type: 'object', properties: { variation_code: { type: 'string', example: 'mtn-10mb-100' }, name: { type: 'string', example: '10MB - 1 Day' }, variation_amount: { type: 'string', example: '100.00' }, fixedPrice: { type: 'string', example: 'Yes' } } } } } } } } },
            '400': { description: 'Invalid serviceID' },
            '401': { description: 'Unauthorized' }
          }
        }
      },
      '/bills/data/pay': {
        post: {
          tags: ['Bills'],
          summary: 'Purchase data bundle',
          description: 'Buy a data plan for any Nigerian network. Debits wallet if useWallet is true.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['serviceID', 'phone', 'variationCode', 'amount'], properties: { serviceID: { type: 'string', enum: ['mtn-data', 'glo-data', 'airtel-data', 'etisalat-data'], example: 'mtn-data' }, phone: { type: 'string', example: '08012345678' }, variationCode: { type: 'string', example: 'mtn-10mb-100', description: 'Plan variation code from /data/plans' }, amount: { type: 'number', example: 100 }, useWallet: { type: 'boolean', example: true } } } } }
          },
          responses: {
            '201': { description: 'Data purchased successfully' },
            '400': { description: 'Invalid input or insufficient balance' },
            '401': { description: 'Unauthorized' },
            '500': { description: 'Provider error' }
          }
        }
      },
      '/bills/tv/verify': {
        post: {
          tags: ['Bills'],
          summary: 'Verify smartcard number',
          description: 'Validate a TV smartcard/IUC number and retrieve customer details.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['serviceID', 'smartcardNumber'], properties: { serviceID: { type: 'string', enum: ['dstv', 'gotv', 'startimes', 'showmax'], example: 'dstv' }, smartcardNumber: { type: 'string', example: '1234567890' } } } } }
          },
          responses: {
            '200': { description: 'Smartcard verified', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'success' }, data: { type: 'object', properties: { Customer_Name: { type: 'string', example: 'John Doe' }, Current_Bouquet: { type: 'string', example: 'DStv Padi' }, Due_Date: { type: 'string' }, Renewal_Amount: { type: 'number' } } } } } } } },
            '400': { description: 'Invalid serviceID or smartcard not found' },
            '401': { description: 'Unauthorized' }
          }
        }
      },
      '/bills/tv/plans/{serviceID}': {
        get: {
          tags: ['Bills'],
          summary: 'Get TV subscription plans',
          description: 'Returns available subscription plans for a TV provider.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'serviceID', in: 'path', required: true, schema: { type: 'string', enum: ['dstv', 'gotv', 'startimes', 'showmax'] }, description: 'TV provider service ID' }],
          responses: {
            '200': { description: 'TV plans list', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'success' }, data: { type: 'array', items: { type: 'object', properties: { variation_code: { type: 'string', example: 'dstv-padi' }, name: { type: 'string', example: 'DStv Padi' }, variation_amount: { type: 'string', example: '2150.00' }, fixedPrice: { type: 'string', example: 'Yes' } } } } } } } } },
            '400': { description: 'Invalid serviceID' },
            '401': { description: 'Unauthorized' }
          }
        }
      },
      '/bills/tv/pay': {
        post: {
          tags: ['Bills'],
          summary: 'Purchase TV subscription',
          description: 'Subscribe or renew a TV plan (DSTV, GOtv, Startimes, Showmax). Debits wallet if useWallet is true.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['serviceID', 'smartcardNumber', 'variationCode', 'amount', 'phone'], properties: { serviceID: { type: 'string', enum: ['dstv', 'gotv', 'startimes', 'showmax'], example: 'dstv' }, smartcardNumber: { type: 'string', example: '1234567890' }, variationCode: { type: 'string', example: 'dstv-padi', description: 'Plan code from /tv/plans' }, amount: { type: 'number', example: 2150 }, phone: { type: 'string', example: '08012345678' }, subscriptionType: { type: 'string', enum: ['renew', 'change'], example: 'renew', description: 'Renew existing or change bouquet' }, useWallet: { type: 'boolean', example: true } } } } }
          },
          responses: {
            '201': { description: 'TV subscription purchased' },
            '400': { description: 'Invalid input or insufficient balance' },
            '401': { description: 'Unauthorized' },
            '500': { description: 'Provider error' }
          }
        }
      },
      '/bills/electricity/verify': {
        post: {
          tags: ['Bills'],
          summary: 'Verify electricity meter (Bills)',
          description: 'Validate a meter number via VTPass before purchasing electricity.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['serviceID', 'meterNumber', 'type'], properties: { serviceID: { type: 'string', enum: ['ikeja-electric', 'eko-electric', 'kano-electric', 'portharcourt-electric', 'jos-electric', 'ibadan-electric', 'kaduna-electric', 'abuja-electric', 'enugu-electric', 'benin-electric'], example: 'ikeja-electric' }, meterNumber: { type: 'string', example: '12345678901' }, type: { type: 'string', enum: ['prepaid', 'postpaid'], example: 'prepaid' } } } } }
          },
          responses: {
            '200': { description: 'Meter verified', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'success' }, data: { type: 'object', properties: { Customer_Name: { type: 'string' }, Meter_Number: { type: 'string' }, Address: { type: 'string' } } } } } } } },
            '400': { description: 'Invalid input or meter not found' },
            '401': { description: 'Unauthorized' }
          }
        }
      },
      '/bills/electricity/pay': {
        post: {
          tags: ['Bills'],
          summary: 'Purchase electricity (Bills)',
          description: 'Buy electricity token via VTPass. Debits wallet if useWallet is true.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['serviceID', 'meterNumber', 'type', 'amount', 'phone'], properties: { serviceID: { type: 'string', enum: ['ikeja-electric', 'eko-electric', 'kano-electric', 'portharcourt-electric', 'jos-electric', 'ibadan-electric', 'kaduna-electric', 'abuja-electric', 'enugu-electric', 'benin-electric'], example: 'ikeja-electric' }, meterNumber: { type: 'string', example: '12345678901' }, type: { type: 'string', enum: ['prepaid', 'postpaid'], example: 'prepaid' }, amount: { type: 'number', example: 5000, description: 'Amount in Naira (minimum ₦1,000)' }, phone: { type: 'string', example: '08012345678' }, useWallet: { type: 'boolean', example: true } } } } }
          },
          responses: {
            '201': { description: 'Electricity purchased', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'success' }, data: { type: 'object', properties: { token: { type: 'string' }, units: { type: 'string' }, reference: { type: 'string' }, status: { type: 'string' } } } } } } } },
            '400': { description: 'Invalid input or insufficient balance' },
            '401': { description: 'Unauthorized' },
            '500': { description: 'Provider error' }
          }
        }
      },
      '/bills/requery/{requestId}': {
        get: {
          tags: ['Bills'],
          summary: 'Requery bill transaction',
          description: 'Check the status of a pending bill transaction.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'requestId', in: 'path', required: true, schema: { type: 'string' }, description: 'Transaction request ID' }],
          responses: {
            '200': { description: 'Transaction status', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'success' }, data: { type: 'object', properties: { status: { type: 'string', enum: ['delivered', 'pending', 'failed'] }, purchased_code: { type: 'string' }, amount: { type: 'string' } } } } } } } },
            '400': { description: 'Transaction not found or not owned by user' },
            '401': { description: 'Unauthorized' }
          }
        }
      },
      '/bills/transactions': {
        get: {
          tags: ['Bills'],
          summary: 'Get bill transaction history',
          description: 'Returns paginated bill payment history for the authenticated user.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Records per page' },
            { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 }, description: 'Records to skip' }
          ],
          responses: {
            '200': { description: 'Transaction history', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'success' }, data: { type: 'object', properties: { transactions: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, category: { type: 'string', enum: ['airtime', 'data', 'tv', 'electricity'] }, service_id: { type: 'string' }, amount: { type: 'number' }, status: { type: 'string' }, token: { type: 'string' }, created_at: { type: 'string', format: 'date-time' } } } }, total: { type: 'integer' } } } } } } } },
            '401': { description: 'Unauthorized' }
          }
        }
      },
      '/bills/webhook/vtpass': {
        post: {
          tags: ['Bills'],
          summary: 'VTPass webhook',
          description: 'Receives transaction status updates from VTPass. No authentication — verified by payload structure.',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'object', properties: { request_id: { type: 'string' }, status: { type: 'string' }, amount: { type: 'string' }, purchased_code: { type: 'string' } } } } } } }
          },
          responses: {
            '200': { description: 'Webhook acknowledged' }
          }
        }
      },
      '/estate/residents/resend-invite': {
        post: {
          tags: ['Estates'],
          summary: 'Resend estate invitation',
          description: 'Resend invitation email to a specific resident. Requires manager authentication and estate association.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ResendInvitationRequest'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Invitation resent successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/BulkInvitationResponse'
                  }
                }
              }
            },
            '400': {
              description: 'Bad request - email required or invalid',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - authentication required',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '403': {
              description: 'Forbidden - manager role required or not linked to estate',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'User authentication and authorization' },
      { name: 'Users', description: 'User management operations' },
      { name: 'Estates', description: 'Estate management operations' },
      { name: 'Access Control', description: 'Access management and visitor control' },
      { name: 'Payments', description: 'Payment processing and management' },
      { name: 'Plans', description: 'Subscription plan management' },
      { name: 'Referrals', description: 'Referral system management' },
      { name: 'Amenities', description: 'Estate amenities and reservations' },
      { name: 'Community', description: 'Community board and social features' },
      { name: 'Support', description: 'Customer support and ticketing' },
      { name: 'Analytics', description: 'Analytics and reporting' },
      { name: 'Notifications', description: 'Notification management' },
      { name: 'Location', description: 'Address and location management' },
      { name: 'Mobile', description: 'Mobile device management' },
      { name: 'Admin', description: 'Administrative operations' },
      { name: 'Upload', description: 'File upload and bulk operations' },
      { name: 'Parking', description: 'Parking and EV charging management' },
      { name: 'Electricity', description: 'Electricity vending, smart meter management, and token delivery' },
      { name: 'Wallet', description: 'Resident wallet funding, balance, and transaction history' },
      { name: 'Bills', description: 'Airtime, data, TV subscription, and electricity bill payments via VTPass' },
      { name: 'Collections', description: 'Estate fee management, invoice generation, resident payment tracking, and withdrawals' },
      { name: 'Kuda', description: 'Kuda-powered estate virtual wallet — virtual sub-accounts, balances, and transactions' },
      { name: 'Emergency', description: 'Emergency alerts, estate contacts, and location-based emergency contact directory' },
      { name: 'Legal', description: 'Legal documents and policies' },
      { name: 'Webhooks', description: 'Webhook endpoints' }
    ],
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/modules/**/routes/*.ts', './src/modules/**/controllers/*.ts', './src/docs/*.ts']
};

const specs = swaggerJSDoc(options);

export { swaggerUi, specs };
