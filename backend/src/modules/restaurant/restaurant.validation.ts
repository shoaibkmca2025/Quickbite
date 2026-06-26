import { z } from 'zod';

export const listRestaurantsSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    cuisine: z.string().optional(),
    veg: z.enum(['true', 'false']).optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    sort: z.enum(['relevance', 'rating', 'deliveryTime', 'cost']).optional(),
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
    city: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(50).default(20),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().length(24, 'Invalid id') }),
});

export const registerRestaurantSchema = z.object({
  body: z.object({
    // owner account
    ownerName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().optional(),
    // restaurant
    name: z.string().min(1),
    cuisines: z.array(z.string()).default([]),
    address: z.string().min(1),
    city: z.string().min(1),
    pincode: z.string().min(1),
    lat: z.number().optional(),
    lng: z.number().optional(),
    minOrderValue: z.number().min(0).optional(),
  }),
});

export const updateRestaurantSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    cuisines: z.array(z.string()).optional(),
    image: z.string().optional(),
    isOpen: z.boolean().optional(),
    minOrderValue: z.number().min(0).optional(),
    avgPrepTimeMins: z.number().min(1).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    pincode: z.string().optional(),
    hours: z
      .array(
        z.object({
          day: z.number().min(0).max(6),
          open: z.string(),
          close: z.string(),
          closed: z.boolean().optional(),
        })
      )
      .optional(),
  }),
});
