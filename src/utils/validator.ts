import * as yup from 'yup';
import { ValidationError, ValidationErrorResponse } from '../types/validation.type';

export const userRegistrationSchema = yup.object().shape({
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
  //  .required('Phone number is required')
    .matches(
      /^(0[7-9]\d{9}|\+234[7-9]\d{9})$/,
      'Invalid Nigerian phone number'
    ),
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
  address: yup.string().required('Estate address is required')
  .min(5, 'Estate address must be at least 5 characters'),
  type: yup.string().required('Estate type is required')
    .oneOf(['residential', 'mixed', 'other', 'commercial'], 'Invalid estate type'),
  city: yup.string().required('City is required')
    .min(2, 'City must be at least 2 characters'),
  state: yup.string().required('State is required')
    .min(2, 'State must be at least 2 characters'),
  country: yup.string().required('Country is required')
    .min(2, 'Country must be at least 2 characters'),
  invitation_code: yup.string().optional()
    .matches(/^[a-zA-Z0-9]{8}$/, 'Invitation code must be exactly 8 alphanumeric characters'),
  estate_code: yup.string().required('Estate code is required')
    .matches(/^[A-Z0-9]{8}$/, 'Estate code must be exactly 5 uppercase alphanumeric characters'),
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
// export const doctorRegistrationSchema = yup.object().shape({
//   first_name: yup.string()
//     .min(3, 'First name must be at least 3 characters')
//     .required('First name is required'),
//   last_name: yup.string()
//     .min(3, 'Last name must be at least 3 characters')
//     .required('Last name is required'),
//   email: yup.string()
//     .email('Invalid email format')
//     .required('Email is required'),
//   phone: yup.string().optional(),
//   specialty: yup.string()
//     .required('Specialty is required'),
//   hospital_email: yup.string()
//     .required('Hospital email is required'),
// });
// export const doctorUpdateSchema = yup.object().shape({
//   first_name: yup.string()
//     .min(3, 'First name must be at least 3 characters')
//     .required('First name is required'),
//   last_name: yup.string()
//     .min(3, 'Last name must be at least 3 characters')
//     .required('Last name is required'),
//   email: yup.string()
//     .email('Invalid email format')
//     .required('Email is required'),
//   phone: yup.string().optional(),
//   specialty: yup.string()
//     .required('Specialty is required'),
//   hospital_email: yup.string()
//     .required('Hospital email is required'),
// });

// export const paymentInitiationSchema = yup.object().shape({
//   amount: yup.number().positive().required('Amount is required'),
//   email: yup.string().email('Invalid email').required('Email is required'),
//   currency: yup.string().optional().default('NGN'),
//   paymentProvider: yup.string().trim().optional(),
//   paymentMethod: yup.string().trim().required('Payment method is required')
// });

// export const paymentVerificationSchema = yup.object().shape({
//   reference: yup.string().required('Payment reference is required')
// });

// export const appointmentStatusSchema = yup.string().required('Status is required');

// export const patientUpdateSchema = yup.object().shape({
//   user_id: yup.number(),
//   date_of_birth: yup.date(),
//   blood_type: yup.string()
//     .matches(/^(A|B|AB|O)[+-]$/, 'Invalid blood type format'),
//   allergies: yup.string(),
//   medical_history: yup.string(),
//   emergency_contact: yup.string()
//     .min(2, 'Emergency contact name must be at least 2 characters')
//     .max(100, 'Emergency contact name must not exceed 100 characters'),
//   emergency_contact_phone: yup.string()
//     .matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
//   insurance_provider: yup.string()
//     .max(100, 'Insurance provider name must not exceed 100 characters'),
//   insurance_number: yup.string()
//     .max(50, 'Insurance number must not exceed 50 characters')
// }).noUnknown(true);

// export const patientSchema = yup.object().shape({
//   user_id: yup.string()
//     .optional(),
//   date_of_birth: yup.date()
//     .required('Date of birth is required')
//     .max(new Date(), 'Date of birth cannot be in the future'),
//   blood_type: yup.string()
//     .required('Blood type is required')
//     .matches(/^(A|B|AB|O)[+-]$/, 'Invalid blood type format'),
//   allergies: yup.string()
//     .optional()
//     .nullable(),
//   medical_history: yup.string()
//     .optional()
//     .nullable(),
//   emergency_contact: yup.string()
//     .required('Emergency contact name is required')
//     .min(2, 'Emergency contact name must be at least 2 characters')
//     .max(100, 'Emergency contact name must not exceed 100 characters'),
//   emergency_contact_phone: yup.string()
//     .required('Emergency contact phone is required')
//     .matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
//   insurance_provider: yup.string()
//     .optional()
//     .max(100, 'Insurance provider name must not exceed 100 characters'),
//   insurance_number: yup.string()
//     .optional()
//     .max(50, 'Insurance number must not exceed 50 characters')
// }).noUnknown(true);
