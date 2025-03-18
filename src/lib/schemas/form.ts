import * as z from "zod";

const socialSchema = z.object({
  platform: z.string().min(1, "Please select a platform"),
  handle: z.string().url("Please enter a valid URL")
});

export const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z
    .string()
    .regex(/^\d{10}$/)
    .optional(),
  email: z.string().email().optional(),
  dob: z.date({ required_error: "A date of birth is required." }).optional(),
  region: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  language: z.string().min(1).optional(),
  category: z.array(z.string()).min(1, "At least one category is required"),
  socialHandles: z
    .array(socialSchema)
    .min(1, "At least one social handle is required"),
  photo: z
    .instanceof(File)
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB"
    )
    .optional()
});
