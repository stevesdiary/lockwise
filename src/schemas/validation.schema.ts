import * as yup from "yup";

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup.string().trim().required("Password is required"),
});

export const userRegistrationSchema = yup.object().shape({
  first_name: yup.string().trim().required("First name is required"),
  last_name: yup.string().trim().required("Last name is required"),
  email: yup
    .string()
    .trim()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    )
    .required("Password is required"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

export const userVerificationSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .email("Invalid email format")
    .required("Email is required"),
  code: yup.string().trim().required("Verification code is required"),
});

export const emailSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .email("Invalid email format")
    .required("Email is required"),
});

export const userUpdateSchema = yup.object().shape({
  first_name: yup.string().optional(),
  last_name: yup.string().optional(),
  email: yup.string().trim().email("Invalid email format").optional(),
  phone: yup.string().trim().optional(),
});

export const passwordResetSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    )
    .required("Password is required"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});
export const idSchema = yup.string().trim().required("ID is required");

export const estateSchema = yup.object().shape({
  name: yup.string().trim().required("Estate name is required"),
  description: yup.string().trim().required("Estate description is required"),
  address: yup.string().trim().required("Estate address is required"),
  city: yup.string().trim().required("Estate city is required"),
  state: yup.string().trim().required("Estate state is required"),
  country: yup.string().trim().required("Estate country is required"),
  phone: yup.string().trim().optional(),
  email: yup.string().trim().email("Invalid email format").optional(),
});
export const estateUpdateSchema = yup.object().shape({
  name: yup.string().trim().optional(),
  description: yup.string().trim().optional(),
  address: yup.string().trim().optional(),
  city: yup.string().trim().optional(),
  state: yup.string().trim().optional(),
  country: yup.string().trim().optional(),
  phone: yup.string().trim().optional(),
  email: yup.string().trim().email("Invalid email format").optional(),
});
