import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './coupon.controller';

const router = Router();

const createSchema = z.object({
  body: z.object({
    code: z.string().min(3),
    description: z.string().optional(),
    type: z.enum(['flat', 'percent']),
    value: z.number().positive(),
    maxDiscount: z.number().optional(),
    minOrderValue: z.number().min(0).optional(),
    validFrom: z.coerce.date().optional(),
    validTo: z.coerce.date().optional(),
    usageLimit: z.number().optional(),
    perUserLimit: z.number().optional(),
    restaurant: z.string().length(24).optional(),
    active: z.boolean().optional(),
  }),
});
const idSchema = z.object({ params: z.object({ id: z.string().length(24) }) });

// Public offers (customer app)
router.get('/', ctrl.listOffers);

// Admin management (PRD FR-ADM-04)
router.get('/all', authenticate, authorize('admin'), ctrl.listAll);
router.post('/', authenticate, authorize('admin'), validate(createSchema), ctrl.create);
router.patch('/:id', authenticate, authorize('admin'), validate(idSchema), ctrl.update);
router.delete('/:id', authenticate, authorize('admin'), validate(idSchema), ctrl.remove);

export default router;
