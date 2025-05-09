// import * as yup from 'yup';

// export const userRegistrationSchema = yup.object().shape({
//   first_name: yup
//     .string()
//     .trim()
//     .required('First name is required')
//     .min(2, 'First name must be at least 2 characters')
//     .max(50, 'First name must be at most 50 characters'),

//   last_name: yup
//     .string()
//     .trim()
//     .required('Last name is required')
//     .min(2, 'Last name must be at least 2 characters')
//     .max(50, 'Last name must be at most 50 characters'),
  
//   email: yup
//     .string()
//     .trim()
//     .required('Email is required')
//     .email('Invalid email format'),
  
//   password: yup
//     .string()
//     .required('Password is required')
//     .min(8, 'Password must be at least 8 characters')
//     .matches(
//       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/,
//       'Password must include uppercase, lowercase, number, and special character'
//     ),
  
//   confirm_password: yup
//     .string()
//     .required('Confirm Password is required')
//     .oneOf([yup.ref('password')], 'Passwords must match'),
//   phone: yup
//     .string()
//     .trim()
//   //  .required('Phone number is required')
//     .matches(
//       /^(0[7-9]\d{9}|\+234[7-9]\d{9})$/,
//       'Invalid Nigerian phone number'
//     ),
// });

// export const idSchema = yup.string().required('Id is required');

// export const userUpdateSchema = yup.object().shape({
//   // name: yup.string().optional(),
//   // email: yup.string().email('Invalid email format').optional(),
//   password: yup.string().trim()
//   .min(6, 'Password must be at least 6 characters')
//   .optional(),
//   confirm_password: yup.string()
//   .min(6, 'Password must be at least 6 characters')
//   .oneOf([yup.ref('password')], 'Passwords must match')

// });

// export const loginSchema = yup.object().shape({
//   email: yup.string().email('Invalid email format').required('Email is required'),
//   password: yup.string().required('Password is required'),
// });

// export const userVerificationSchema = yup.object().shape({
//   email: yup
//     .string()
//     .trim()
//     .required('Email is required')
//     .email('Invalid email format'),
  
//   code: yup
//     .string()
//     .trim()
//     .required('Verification code is required')
//     .length(6, 'Verification code must be 6 digits')
// });

// export const emailSchema = yup.object().shape({
//   email: yup.string().email('Invalid email format').required('Email is required')
// });

// export const hospitalVerificationSchema = yup.object().shape({
//   email: yup
//     .string()
//     .trim()
//     .required('Email is required')
//     .email('Invalid email format'),
  
//   code: yup
//     .string()
//     .trim()
//     .required('Verification code is required')
//     .length(6, 'Verification code must be 6 digits')
// });

// export const hospitalRegistrationSchema = yup.object().shape({
//   name: yup.string().required('Name is required'),
//   email: yup.string().email('Invalid email format').required('Email is required'),
//   phone: yup.string()
//     .required('Phone number is required')
//     .matches(
//       /^(0[7-9]\d{9}|\+234[7-9]\d{9})$/, 
//       'Invalid Nigerian phone number'
//     ),
//   state: yup.string().required('State is required'),
//   city: yup.string().required('City is required'),
//   address: yup.string().required('Address is required'),
//   services: yup.array().of(yup.string()).optional(),
//   open: yup.boolean().optional(),
//   consultation_fee: yup.number().required('Consultation fee is required'),
//   accepted_insurance: yup.array().of(yup.string()).optional(),
//   role: yup.string().optional(),
//   rating: yup.number().optional()
// });
// export const hospitalUpdateSchema = yup.object().shape({
//   name: yup.string().required('Name is required'),
//   email: yup.string().email('Invalid email format').required('Email is required'),
//   phone: yup.string()
//     .required('Phone number is required')
//     .matches(
//       /^(0[7-9]\d{9}|\+234[7-9]\d{9})$/, 
//       'Invalid Nigerian phone number'
//     ),
//   state: yup.string().required('State is required'),
//   city: yup.string().required('City is required'),
//   address: yup.string().required('Address is required'),
//   services: yup.array().of(yup.string()).optional(),
//   open: yup.boolean().optional(),
//   consultation_fee: yup.number().required('Consultation fee is required'),
//   accepted_insurance: yup.array().of(yup.string()).optional(),
// });

// export const searchSchema = yup.object({
//   page: yup.number().min(1).default(1),
//   limit: yup.number().min(1).max(100).default(10),
//   search: yup.string().optional()
// });

// export const appointmentCreateSchema = yup.object().shape({
//   // patient_id: yup.string()
//   //   .transform((value) => value?.replace(/^"|"$/g, ''))
//   //   .required('Patient ID is required'),
//   doctor_id: yup.string()
//     .transform((value) => value?.replace(/^"|"$/g, ''))
//     .required('Doctor ID is required'),
//   hospital_id: yup.string()
//     .transform((value) => value?.replace(/^"|"$/g, ''))
//     .required('Hospital ID is required'),
//   date: yup.string()
//     .transform((value) => value?.replace(/^"|"$/g, ''))
//     .required('Date is required'),
//   start_time: yup.string()
//     .transform((value) => value?.replace(/^"|"$/g, ''))
//     .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)')
//     .required('Start time is required'),
//   // end_time: yup.string()
//   //   .transform((value) => value?.replace(/^"|"$/g, ''))
//   //   .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)')
//   //   .required('End time is required'),
//   notes: yup.string()
//     .transform((value) => value?.replace(/^"|"$/g, ''))
//     .optional(),
// });

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
