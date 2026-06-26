import { customAlphabet } from 'nanoid';

const digits = customAlphabet('0123456789', 4);
const alnum = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

/** Human-friendly order code, e.g. ORD-9925 */
export function orderCode(): string {
  return `ORD-${digits()}`;
}

/** Short payout / transaction reference, e.g. TXN-7F2KQ9 */
export function txnRef(): string {
  return `TXN-${alnum()}`;
}

/** Partner id, e.g. #8821 style numeric */
export function partnerId(): string {
  return digits();
}
