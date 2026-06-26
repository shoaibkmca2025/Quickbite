import { z } from 'zod';

export const setStatusSchema = z.object({
  body: z.object({ status: z.enum(['online', 'offline', 'busy']) }),
});

export const idSchema = z.object({ params: z.object({ id: z.string().length(24) }) });

export const locationSchema = z.object({
  body: z.object({
    orderId: z.string().length(24).optional(),
    lat: z.number(),
    lng: z.number(),
  }),
});
