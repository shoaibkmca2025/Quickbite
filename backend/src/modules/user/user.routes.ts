import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import * as ctrl from './user.controller';
import {
  updateProfileSchema,
  addressSchema,
  addrIdSchema,
  updateAddressSchema,
} from './user.validation';

const router = Router();
router.use(authenticate);

router.patch('/me', validate(updateProfileSchema), ctrl.updateProfile);
router.get('/me/addresses', ctrl.listAddresses);
router.post('/me/addresses', validate(addressSchema), ctrl.addAddress);
router.patch('/me/addresses/:addrId', validate(updateAddressSchema), ctrl.updateAddress);
router.delete('/me/addresses/:addrId', validate(addrIdSchema), ctrl.deleteAddress);

export default router;
