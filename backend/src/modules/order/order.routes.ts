import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './order.controller';
import {
  quoteSchema,
  createOrderSchema,
  paySchema,
  idSchema,
  cancelSchema,
  acceptSchema,
  rejectSchema,
  restaurantStatusSchema,
  listMineSchema,
  restaurantListSchema,
  reviewSchema,
} from './order.validation';

const router = Router();

// ----- Restaurant order management (place before "/:id" routes) -----
router.get(
  '/restaurant',
  authenticate,
  authorize('restaurant'),
  validate(restaurantListSchema),
  ctrl.restaurantOrders
);
router.post('/:id/accept', authenticate, authorize('restaurant'), validate(acceptSchema), ctrl.accept);
router.post('/:id/reject', authenticate, authorize('restaurant'), validate(rejectSchema), ctrl.reject);
router.post(
  '/:id/status',
  authenticate,
  authorize('restaurant'),
  validate(restaurantStatusSchema),
  ctrl.setStatus
);

// ----- Customer -----
router.post('/quote', authenticate, authorize('customer'), validate(quoteSchema), ctrl.quote);
router.post('/', authenticate, authorize('customer'), validate(createOrderSchema), ctrl.create);
router.get('/mine', authenticate, authorize('customer'), validate(listMineSchema), ctrl.myOrders);
router.post('/:id/pay', authenticate, authorize('customer'), validate(paySchema), ctrl.pay);
router.post('/:id/cancel', authenticate, authorize('customer'), validate(cancelSchema), ctrl.cancel);
router.post('/:id/review', authenticate, authorize('customer'), validate(reviewSchema), ctrl.review);
router.post('/:id/reorder', authenticate, authorize('customer'), validate(idSchema), ctrl.reorder);

// ----- Shared (customer / restaurant / rider / admin — guarded in service) -----
router.get('/:id', authenticate, validate(idSchema), ctrl.detail);

export default router;
