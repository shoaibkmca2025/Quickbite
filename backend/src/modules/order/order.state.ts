import { OrderStatus } from '../../utils/constants';

/** Allowed forward transitions for the order lifecycle. */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ['placed', 'cancelled'],
  placed: ['accepted', 'rejected', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['assigned', 'picked_up', 'cancelled'],
  assigned: ['picked_up', 'cancelled'],
  picked_up: ['out_for_delivery', 'delivered'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
  rejected: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Statuses at/after which a customer can no longer cancel for free. */
export function isCancellableByCustomer(status: OrderStatus): boolean {
  return status === 'placed' || status === 'accepted';
}
