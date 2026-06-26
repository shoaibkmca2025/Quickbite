import { z } from 'zod';

const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{10,15}$/, 'Enter a valid phone number');

export const requestOtpSchema = z.object({
  body: z.object({ phone }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    phone,
    code: z.string().length(6, 'OTP must be 6 digits'),
    name: z.string().min(1).max(60).optional(),
    role: z.enum(['customer', 'rider']).optional(),
  }),
});

export const passwordLoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

export const refreshSchema = z.object({
  body: z.object({ refreshToken: z.string().min(10) }),
});
