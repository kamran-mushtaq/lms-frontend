import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  datetime: z.preprocess((arg) => {
    if (!arg) return undefined;
    return typeof arg === "string" || arg instanceof Date
      ? new Date(arg)
      : null;
  }, z.date({ invalid_type_error: "Please enter a valid date." }).max(new Date(), { message: "Date of birth cannot be in the future." }).optional()),
  email: z
    .string()
    .email({ message: "Invalid email address." })
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(/^[0-9]+$/, { message: "Phone must only contain numbers." })
    .min(5, { message: "Phone must be at least 5 characters." })
    .optional()
    .or(z.literal("")),
  // url: z.string().url({ message: "Invalid URL." }),
  socialHandles: z
    .array(
      z.object({
        platform: z.string().min(1, "Platform is required."),
        handle: z
          .string()
          .url({ message: "Invalid handle URL format." }) // Ensures handle is a valid URL
          .min(1, "Handle is required."),
      })
    )
    .nonempty("At least one social handle is required."), // Ensures at least one handle is present
  region: z.string().min(1, { message: "Region is required." }), // Added validation for empty value
  city: z.string().min(1, { message: "City is required." }), // Added validation for empty value
  /* 
  dob: z.preprocess(
    (arg) =>
      typeof arg === "string" || arg instanceof Date ? new Date(arg) : null,
    z
      .date({ required_error: "A valid date of birth is required." })
      .max(new Date(), { message: "Date of birth cannot be in the future." }) // DOB cannot be in the future
  ), 
  */
  language: z.string().min(1, { message: "Language is required." }), // Added validation for empty value
  category: z.array(z.string()).nonempty("Please select at least one item."),
  photo: z
    .array(z.instanceof(File), { message: "Photo must be a file instance." })
    .optional()
    .default([]),
});

// Type for the form data
export type FormData = z.infer<typeof formSchema>;
