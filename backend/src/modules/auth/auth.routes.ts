import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import * as ctrl from './auth.controller';
import {
  requestOtpSchema,
  verifyOtpSchema,
  passwordLoginSchema,
  refreshSchema,
} from './auth.validation';

const router = Router();

// Throttle OTP + login to mitigate abuse (PRD NFR-SEC-01).
const otpLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, standardHeaders: true });
const loginLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true });

router.post('/otp/request', otpLimiter, validate(requestOtpSchema), ctrl.requestOtp);
router.post('/otp/verify', otpLimiter, validate(verifyOtpSchema), ctrl.verifyOtp);
router.post('/login', loginLimiter, validate(passwordLoginSchema), ctrl.passwordLogin);
router.post('/refresh', validate(refreshSchema), ctrl.refresh);
router.get('/me', authenticate, ctrl.me);

export default router;
