import * as z from "zod";

export const parentRegistrationSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(50, { message: "Name cannot exceed 50 characters" }),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(100, { message: "Password cannot exceed 100 characters" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
    phone: z
      .string()
      .min(10, { message: "Phone number must be at least 10 digits" })
      .max(15, { message: "Phone number cannot exceed 15 digits" }),
    country: z.string().min(1, { message: "Country is required" }),
    city: z.string().min(1, { message: "City is required" }),
    agreeTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: "You must agree to the terms and conditions"
      })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

export const otpVerificationSchema = z.object({
  otp: z
    .string()
    .min(4, { message: "OTP must be at least 4 characters" })
    .max(6, { message: "OTP cannot exceed 6 characters" })
});

export const studentRegistrationSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name cannot exceed 50 characters" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  dob: z.date({ required_error: "Date of birth is required" }),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Gender is required",
    invalid_type_error: "Gender must be 'male', 'female', or 'other'"
  }),
  classId: z.string().min(1, { message: "Class is required" })
});

export type ParentRegistrationFormValues = z.infer<
  typeof parentRegistrationSchema
>;
export type OtpVerificationFormValues = z.infer<typeof otpVerificationSchema>;
export type StudentRegistrationFormValues = z.infer<
  typeof studentRegistrationSchema
>;
