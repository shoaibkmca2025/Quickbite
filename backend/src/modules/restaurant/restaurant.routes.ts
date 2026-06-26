import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './restaurant.controller';
import {
  listRestaurantsSchema,
  idParamSchema,
  registerRestaurantSchema,
  updateRestaurantSchema,
} from './restaurant.validation';

const router = Router();

// Public discovery (PRD §8.1.2)
router.get('/', validate(listRestaurantsSchema), ctrl.list);

// Merchant self-service — defined before "/:id" so they aren't captured as ids.
router.get('/me', authenticate, authorize('restaurant'), ctrl.myRestaurant);
router.patch('/me', authenticate, authorize('restaurant'), validate(updateRestaurantSchema), ctrl.updateMine);
router.get('/me/dashboard', authenticate, authorize('restaurant'), ctrl.dashboard);
router.get('/me/earnings', authenticate, authorize('restaurant'), ctrl.earnings);

// Onboarding (PRD FR-RST-01)
router.post('/register', validate(registerRestaurantSchema), ctrl.register);

router.get('/:id', validate(idParamSchema), ctrl.detail);
router.get('/:id/reviews', validate(idParamSchema), ctrl.reviews);

export default router;
