import { z } from 'zod';
import { PAYMENT_METHODS } from '../../utils/constants';

const cartItem = z.object({
  menuItemId: z.string().length(24),
  quantity: z.number().int().min(1).max(50),
  options: z
    .array(z.object({ groupName: z.string(), label: z.string() }))
    .optional()
    .default([]),
});

const address = z.object({
  label: z.string().optional(),
  line: z.string().min(1),
  city: z.string().min(1),
  pincode: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
  instructions: z.string().optional(),
});

export const quoteSchema = z.object({
  body: z.object({
    restaurantId: z.string().length(24),
    items: z.array(cartItem).min(1),
    couponCode: z.string().optional(),
  }),
});

export const createOrderSchema = z.object({
  body: z.object({
    restaurantId: z.string().length(24),
    items: z.array(cartItem).min(1),
    couponCode: z.string().optional(),
    paymentMethod: z.enum(PAYMENT_METHODS),
    address,
  }),
});

export const paySchema = z.object({
  params: z.object({ id: z.string().length(24) }),
  body: z.object({
    idempotencyKey: z.string().min(8).optional(),
    simulateFailure: z.boolean().optional(), // dev: force a failed payment to test retry
  }),
});

export const idSchema = z.object({ params: z.object({ id: z.string().length(24) }) });

export const cancelSchema = z.object({
  params: z.object({ id: z.string().length(24) }),
  body: z.object({ reason: z.string().optional() }),
});

export const acceptSchema = z.object({
  params: z.object({ id: z.string().length(24) }),
  body: z.object({ prepTimeMins: z.number().int().min(1).max(180) }),
});

export const rejectSchema = z.object({
  params: z.object({ id: z.string().length(24) }),
  body: z.object({ reason: z.string().min(1) }),
});

export const restaurantStatusSchema = z.object({
  params: z.object({ id: z.string().length(24) }),
  body: z.object({ status: z.enum(['preparing', 'ready']) }),
});

export const listMineSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
  }),
});

export const restaurantListSchema = z.object({
  query: z.object({
    group: z.enum(['active', 'completed', 'all']).default('active'),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(50),
  }),
});

export const reviewSchema = z.object({
  params: z.object({ id: z.string().length(24) }),
  body: z.object({
    foodRating: z.number().int().min(1).max(5),
    deliveryRating: z.number().int().min(1).max(5).optional(),
    comment: z.string().max(1000).optional(),
  }),
});
