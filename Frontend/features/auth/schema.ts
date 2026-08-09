import { email, z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  email: z.email("Please enter a valid email"),
  phoneNumber: z
    .string()
    .regex(
      /^0\d{10}$/,
      "Phone number must start with 0 and be exactly 11 digits",
    ),
  marketLocation: z.string().min(2, "Market location is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().min(3, "Email must not be empty"),
  password: z.string().min(3, "password must not be empty")
})

export type SignupPayload = z.infer<typeof signupSchema>;