import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './admin.controller';

const router = Router();
router.use(authenticate, authorize('admin'));

const idSchema = z.object({ params: z.object({ id: z.string().length(24) }) });
const statusSchema = z.object({
  params: z.object({ id: z.string().length(24) }),
  body: z.object({ isApproved: z.boolean().optional(), isOpen: z.boolean().optional() }),
});
const activeSchema = z.object({
  params: z.object({ id: z.string().length(24) }),
  body: z.object({ isActive: z.boolean() }),
});
const assignSchema = z.object({
  params: z.object({ id: z.string().length(24) }),
  body: z.object({ riderId: z.string().length(24) }),
});
const refundSchema = z.object({
  params: z.object({ id: z.string().length(24) }),
  body: z.object({ reason: z.string().min(1) }),
});

router.get('/overview', ctrl.overview);
router.get('/orders/live', ctrl.liveOrders);
router.get('/restaurants', ctrl.listRestaurants);
router.patch('/restaurants/:id', validate(statusSchema), ctrl.setRestaurantStatus);
router.get('/riders', ctrl.listRiders);
router.patch('/users/:id/active', validate(activeSchema), ctrl.setUserActive);
router.post('/orders/:id/assign-rider', validate(assignSchema), ctrl.assignRider);
router.post('/orders/:id/refund', validate(refundSchema), ctrl.refund);

export default router;
