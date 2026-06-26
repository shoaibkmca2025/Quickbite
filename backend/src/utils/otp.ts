import crypto from 'crypto';
import { logger } from '../config/logger';
import { env } from '../config/env';

/** Generates a 6-digit numeric OTP. */
export function generateOtp(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

/**
 * "Sends" an OTP. In dev mode we just log it (and the caller returns it in the
 * response). In production, replace this with an SMS provider (Twilio / MSG91).
 */
export async function sendOtpSms(phone: string, code: string): Promise<void> {
  if (env.otp.devMode) {
    logger.info(`[DEV OTP] ${phone} -> ${code} (valid ${env.otp.ttlSeconds}s)`);
    return;
  }
  // TODO: integrate real SMS provider here.
  logger.warn(`OTP_DEV_MODE is false but no SMS provider is configured for ${phone}`);
}
