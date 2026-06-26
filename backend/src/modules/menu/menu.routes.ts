import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './menu.controller';
import {
  createItemSchema,
  updateItemSchema,
  itemIdSchema,
  availabilitySchema,
} from './menu.validation';

const router = Router();

// All menu-management routes require a restaurant account.
router.use(authenticate, authorize('restaurant'));

router.get('/mine', ctrl.listMine);
router.post('/', validate(createItemSchema), ctrl.create);
router.patch('/:id', validate(updateItemSchema), ctrl.update);
router.patch('/:id/availability', validate(availabilitySchema), ctrl.setAvailability);
router.delete('/:id', validate(itemIdSchema), ctrl.remove);

export default router;
