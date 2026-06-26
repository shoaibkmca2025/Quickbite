import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(60).optional(),
    avatar: z.string().optional(),
    email: z.string().email().optional(),
    notificationPrefs: z
      .object({
        push: z.boolean().optional(),
        sms: z.boolean().optional(),
        email: z.boolean().optional(),
      })
      .optional(),
  }),
});

export const addressSchema = z.object({
  body: z.object({
    label: z.string().optional(),
    line: z.string().min(1),
    city: z.string().min(1),
    pincode: z.string().min(1),
    lat: z.number().optional(),
    lng: z.number().optional(),
    isDefault: z.boolean().optional(),
    instructions: z.string().optional(),
  }),
});

export const addrIdSchema = z.object({
  params: z.object({ addrId: z.string().length(24) }),
});

export const updateAddressSchema = z.object({
  params: z.object({ addrId: z.string().length(24) }),
  body: addressSchema.shape.body.partial(),
});
