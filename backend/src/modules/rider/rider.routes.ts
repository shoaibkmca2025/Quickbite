import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import * as ctrl from './rider.controller';
import { setStatusSchema, idSchema, locationSchema } from './rider.validation';

const router = Router();

router.use(authenticate, authorize('rider'));

router.post('/status', validate(setStatusSchema), ctrl.setStatus);
router.get('/assignments', ctrl.assignments);
router.get('/earnings', ctrl.earnings);
router.post('/location', validate(locationSchema), ctrl.location);

router.post('/orders/:id/claim', validate(idSchema), ctrl.claim);
router.post('/orders/:id/picked-up', validate(idSchema), ctrl.pickedUp);
router.post('/orders/:id/out-for-delivery', validate(idSchema), ctrl.outForDelivery);
router.post('/orders/:id/delivered', validate(idSchema), ctrl.delivered);

export default router;
