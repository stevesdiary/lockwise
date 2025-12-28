import * as yup from 'yup';

// Plan validation schemas
export const createPlanSchema = yup.object().shape({
  name: yup.string().required('Plan name is required').min(2, 'Plan name must be at least 2 characters'),
  price: yup.number().required('Price is required').min(0, 'Price must be positive'),
  description: yup.string().optional(),
  features: yup.array().of(yup.string()).optional(),
  duration_months: yup.number().optional().min(1, 'Duration must be at least 1 month'),
  is_active: yup.boolean().optional().default(true)
});

export const updatePlanSchema = yup.object().shape({
  name: yup.string().optional().min(2, 'Plan name must be at least 2 characters'),
  price: yup.number().optional().min(0, 'Price must be positive'),
  description: yup.string().optional(),
  features: yup.array().of(yup.string()).optional(),
  duration_months: yup.number().optional().min(1, 'Duration must be at least 1 month'),
  is_active: yup.boolean().optional()
});

// Resident validation schemas
export const createResidentSchema = yup.object().shape({
  user_id: yup.string().required('User ID is required'),
  estate_id: yup.string().required('Estate ID is required'),
  unit_id: yup.string().required('Unit ID is required'),
  move_in_date: yup.date().required('Move in date is required'),
  lease_start_date: yup.date().optional(),
  lease_end_date: yup.date().optional(),
  emergency_contact_name: yup.string().optional(),
  emergency_contact_phone: yup.string().optional(),
  status: yup.string().oneOf(['active', 'inactive', 'pending']).optional().default('active')
});

export const updateResidentSchema = yup.object().shape({
  unit_id: yup.string().optional(),
  move_in_date: yup.date().optional(),
  lease_start_date: yup.date().optional(),
  lease_end_date: yup.date().optional(),
  emergency_contact_name: yup.string().optional(),
  emergency_contact_phone: yup.string().optional(),
  status: yup.string().oneOf(['active', 'inactive', 'pending']).optional()
});

// FAQ validation schemas
export const createFAQSchema = yup.object().shape({
  question: yup.string().required('Question is required').min(10, 'Question must be at least 10 characters'),
  answer: yup.string().required('Answer is required').min(10, 'Answer must be at least 10 characters'),
  category: yup.string().required('Category is required'),
  is_active: yup.boolean().optional().default(true),
  order: yup.number().optional().min(0, 'Order must be positive')
});

export const updateFAQSchema = yup.object().shape({
  question: yup.string().optional().min(10, 'Question must be at least 10 characters'),
  answer: yup.string().optional().min(10, 'Answer must be at least 10 characters'),
  category: yup.string().optional(),
  is_active: yup.boolean().optional(),
  order: yup.number().optional().min(0, 'Order must be positive')
});

// Notification validation schemas
export const createNotificationSchema = yup.object().shape({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  message: yup.string().required('Message is required').min(10, 'Message must be at least 10 characters'),
  type: yup.string().oneOf(['info', 'success', 'warning', 'error']).required('Type is required'),
  recipient_type: yup.string().oneOf(['user', 'estate', 'all']).required('Recipient type is required'),
  recipient_id: yup.string().when('recipient_type', {
    is: (val: string) => val === 'user' || val === 'estate',
    then: (schema) => schema.required('Recipient ID is required'),
    otherwise: (schema) => schema.optional()
  }),
  scheduled_at: yup.date().optional(),
  expires_at: yup.date().optional()
});

// Emergency validation schemas
export const createEmergencySchema = yup.object().shape({
  type: yup.string().required('Emergency type is required')
    .oneOf(['fire', 'medical', 'security', 'maintenance', 'other']),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  location: yup.string().required('Location is required'),
  priority: yup.string().oneOf(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  reporter_id: yup.string().required('Reporter ID is required'),
  estate_id: yup.string().required('Estate ID is required')
});

// Support ticket validation schemas
export const createSupportTicketSchema = yup.object().shape({
  subject: yup.string().required('Subject is required').min(5, 'Subject must be at least 5 characters'),
  description: yup.string().required('Description is required').min(20, 'Description must be at least 20 characters'),
  category: yup.string().required('Category is required')
    .oneOf(['technical', 'billing', 'general', 'feature_request', 'bug_report']),
  priority: yup.string().oneOf(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  user_id: yup.string().required('User ID is required')
});

export const updateSupportTicketSchema = yup.object().shape({
  status: yup.string().oneOf(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: yup.string().oneOf(['low', 'medium', 'high', 'urgent']).optional(),
  assigned_to: yup.string().optional(),
  resolution: yup.string().optional()
});

// Community board validation schemas
export const createCommunityPostSchema = yup.object().shape({
  title: yup.string().required('Title is required').min(5, 'Title must be at least 5 characters'),
  content: yup.string().required('Content is required').min(20, 'Content must be at least 20 characters'),
  category: yup.string().required('Category is required')
    .oneOf(['announcement', 'event', 'discussion', 'marketplace', 'lost_found']),
  estate_id: yup.string().required('Estate ID is required'),
  author_id: yup.string().required('Author ID is required'),
  is_pinned: yup.boolean().optional().default(false),
  expires_at: yup.date().optional()
});

export const updateCommunityPostSchema = yup.object().shape({
  title: yup.string().optional().min(5, 'Title must be at least 5 characters'),
  content: yup.string().optional().min(20, 'Content must be at least 20 characters'),
  category: yup.string().optional()
    .oneOf(['announcement', 'event', 'discussion', 'marketplace', 'lost_found']),
  is_pinned: yup.boolean().optional(),
  expires_at: yup.date().optional()
});