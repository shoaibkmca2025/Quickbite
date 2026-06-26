import { z } from 'zod';

const optionGroup = z.object({
  name: z.string().min(1),
  required: z.boolean().optional(),
  multi: z.boolean().optional(),
  choices: z
    .array(z.object({ label: z.string().min(1), priceDelta: z.number().default(0) }))
    .default([]),
});

export const createItemSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().min(0),
    category: z.string().min(1),
    image: z.string().optional(),
    isVeg: z.boolean().optional(),
    available: z.boolean().optional(),
    optionGroups: z.array(optionGroup).optional(),
    sortOrder: z.number().optional(),
  }),
});

export const updateItemSchema = z.object({
  params: z.object({ id: z.string().length(24) }),
  body: createItemSchema.shape.body.partial(),
});

export const itemIdSchema = z.object({
  params: z.object({ id: z.string().length(24) }),
});

export const availabilitySchema = z.object({
  params: z.object({ id: z.string().length(24) }),
  body: z.object({ available: z.boolean() }),
});
