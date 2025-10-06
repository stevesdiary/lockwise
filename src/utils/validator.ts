import * as yup from 'yup';
const addressSchema = yup.object().shape({
  number: yup.string()
    .optional()
    .matches(/^[\w\s-]+$/, 'Invalid plot number format'),

  street: yup.string()
    .required('Street is required')
    .min(2, 'Street name must be at least 2 characters'),

  city: yup.string()
    .required('City is required')
    .min(2, 'City name must be at least 2 characters'),

  country: yup.string()
    .required('Country is required')
    .min(2, 'Country name must be at least 2 characters'),
});

export const userRegistrationSchema = yup.object().shape({
  title: yup
    .string()
    .trim()
    .required('Title is required')
    .oneOf(['Mr', 'Mrs', 'Ms', 'Dr', 'Prof', 'Alhj', 'Chief', 'HRH', 'HRM'], 'Invalid title'),

  first_name: yup
    .string()
    .trim()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be at most 50 characters'),

  last_name: yup
    .string()
    .trim()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be at most 50 characters'),
  
  email: yup
    .string()
    .trim()
    .required('Email is required')
    .email('Invalid email format'),
  
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/,
      'Password must include uppercase, lowercase, number, and special character'
    ),
  
  confirm_password: yup
    .string()
    .required('Confirm Password is required')
    .oneOf([yup.ref('password')], 'Passwords must match'),
    
  phone: yup
    .string()
    .trim()
    .required('Phone number is required')
    .matches(
      /^(0[7-9]\d{9}|\+234[7-9]\d{9})$/,
      'Invalid Nigerian phone number'
    ),

  role: yup
    .string()
    .required('Role is required')
    .oneOf(['resident', 'manager'], 'Role must be either resident or manager'),
    
  estate_code: yup
    .string()
    .trim()
    .when('role', {
      is: 'resident',
      then: (schema) => schema.required('Estate code is required for residents'),
      otherwise: (schema) => schema.optional()
    })
    .min(6, 'Estate code must be at least 6 characters'),
});

export const idSchema = yup.string().required('Id is required');

export const userUpdateSchema = yup.object().shape({
  // name: yup.string().optional(),
  // email: yup.string().email('Invalid email format').optional(),
  password: yup.string().trim()
  .min(6, 'Password must be at least 6 characters')
  .optional(),
  confirm_password: yup.string()
  .min(6, 'Password must be at least 6 characters')
  .oneOf([yup.ref('password')], 'Passwords must match')

});

export const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().required('Password is required'),
});

export const userVerificationSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .required('Email is required')
    .email('Invalid email format'),
  
  code: yup
    .string()
    .trim()
    .required('Verification code is required')
    .length(6, 'Verification code must be 6 digits')
});

export const emailSchema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required')
});

export const hospitalVerificationSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .required('Email is required')
    .email('Invalid email format'),
  
  code: yup
    .string()
    .trim()
    .required('Verification code is required')
    .length(6, 'Verification code must be 6 digits')
});

export const createEstateSchema = yup.object().shape({
  name: yup.string().required('Estate name is required')
    .min(2, 'Estate name must be at least 2 characters'),
  address: addressSchema,
  type: yup.string().required('Estate type is required')
    .oneOf(['residential', 'mixed', 'other', 'commercial'], 'Invalid estate type'),
  estate_code: yup.string().optional(),
  number_of_appartments: yup.number().optional()
    .min(1, 'Number of apartments must be at least 1'),
  total_number_of_floors: yup.number().optional().min(3, 'Number of floors must be at least 3'),
});

export const searchSchema = yup.object({
  page: yup.number().min(1).default(1),
  limit: yup.number().min(1).max(100).default(10),
  search: yup.string().optional()
});

export const estateUpdateSchema = yup.object().shape({
  name: yup.string().optional(),
  address: yup.string().optional(),
  type: yup.string().optional(),
  city: yup.string().optional(),
  state: yup.string().optional(),
  country: yup.string().optional(),
  invitation_code: yup.string().optional(),
  estate_code: yup.string().optional(),
  number_of_appartments: yup.number().optional(),
  number_of_floors: yup.number().optional(),
  logo: yup.string().optional(),
  cover_image: yup.string().optional(),
  description: yup.string().optional(),
  contact_phone: yup.string().optional(),
  contact_email: yup.string().email('Invalid email format').optional(),
  contact_address: yup.string().optional(),
  approval_status: yup.string().oneOf(['pending', 'approved', 'denied']).optional(),
  approved_by: yup.string().optional(),
  approved_on: yup.boolean().optional(),
  verified: yup.boolean().optional(),

});
export const estateIdSchema = yup.object().shape({
  estate_id: yup.string().required('Estate ID is required')
});
export const estateSearchSchema = yup.object().shape({
  page: yup.number().min(1).default(1),
  limit: yup.number().min(1).max(100).default(10),
  search: yup.string().optional(),
  type: yup.string().oneOf(['residential', 'mixed', 'other', 'commercial']).optional(),
  city: yup.string().optional(),
  state: yup.string().optional(),
  country: yup.string().optional(),
});

export const paymentInitiationSchema = yup.object().shape({
  amount: yup.number().positive().required('Amount is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  currency: yup.string().optional().default('NGN'),
  paymentProvider: yup.string().trim().optional(),
  paymentMethod: yup.string().trim().required('Payment method is required')
});

export const paymentVerificationSchema = yup.object().shape({
  reference: yup.string().required('Payment reference is required')
});

// export const appointmentStatusSchema = yup.string().required('Status is required');

export const createPermissionSchema = yup.object().shape({
  user_id: yup.string().optional(),
})
export const updatePermissionSchema = yup.object().shape({
  user_id: yup.string().optional(),
  permission: yup.string().required('Permission is required')
});

export const createAccessSchema = yup.object().shape({
  user_id: yup.string().required('User ID is required'),
  access_code: yup.string().required('Access code is required').length(6, 'Access code must be 6 characters'),
  date_in: yup.date().required('Entry date is required'),
  date_out: yup.date().required('Exit date is required')
    .min(yup.ref('date_in'), 'Exit date must be after entry date'),
  estate_id: yup.string().required('Estate ID is required'),
  access_type: yup.string().oneOf(['guest', 'resident', 'staff', 'delivery', 'maintenance', 'security', 'others']).required('Access type is required'),
  verification_method: yup.string().oneOf(['RFID', 'QR_code', 'access_code', 'manual_approval']).optional().default('access_code'),
  vehicle_number: yup.string().optional(),
  status: yup.string().oneOf(['approved', 'pending', 'denied', 'cancelled', 'expired']).required('Status is required'),
  remarks: yup.string().optional(),
  resident_id: yup.string().required('Resident ID is required'),
  created_by: yup.string().required('Created by is required'),
  is_multi_entry: yup.boolean().optional().default(false),
  max_entries: yup.number().optional().min(1, 'Max entries must be at least 1').when('is_multi_entry', {
    is: true,
    then: (schema) => schema.required('Max entries is required for multi-entry access'),
    otherwise: (schema) => schema.optional()
  })
});

export const entryOperationSchema = yup.object().shape({
  access_id: yup.string().required('Access ID is required'),
  scanned_by: yup.string().optional(),
  gate_id: yup.string().optional(),
  remarks: yup.string().optional()
});

export const exitOperationSchema = yup.object().shape({
  entry_id: yup.string().required('Entry ID is required'),
  scanned_by: yup.string().optional(),
  gate_id: yup.string().optional(),
  remarks: yup.string().optional()
});

export const multipleEntryConfigSchema = yup.object().shape({
  is_multi_entry: yup.boolean().required('Multi-entry flag is required'),
  max_entries: yup.number().optional().min(1, 'Max entries must be at least 1').when('is_multi_entry', {
    is: true,
    then: (schema) => schema.required('Max entries is required for multi-entry access'),
    otherwise: (schema) => schema.optional()
  })
});

export const referrerCreationSchema = yup.object().shape({
  name: yup.string().required(),
  phone: yup
    .string()
    .trim()
    .optional()
    .matches(
      /^(0[7-9]\d{9}|\+234[7-9]\d{9})$/,
      'Invalid phone number'
    ),
  email: yup
    .string()
    .trim()
    .required('Email is required')
    .email('Invalid email format')
})
