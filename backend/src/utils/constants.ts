/** Shared domain enums used across models, services, sockets, and clients. */

export const ROLES = ['customer', 'rider', 'restaurant', 'admin'] as const;
export type Role = (typeof ROLES)[number];

/** Order lifecycle (matches PRD §8.1.6 + rider/restaurant flows). */
export const ORDER_STATUSES = [
  'pending_payment', // created, awaiting payment confirmation
  'placed', // paid (or COD) -> restaurant notified
  'accepted', // restaurant accepted, prep time set
  'preparing', // kitchen cooking
  'ready', // ready for pickup
  'assigned', // rider assigned
  'picked_up', // rider collected
  'out_for_delivery', // en route to customer
  'delivered', // completed
  'cancelled', // cancelled by any party
  'rejected', // restaurant rejected
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  'placed',
  'accepted',
  'preparing',
  'ready',
  'assigned',
  'picked_up',
  'out_for_delivery',
];

export const PAYMENT_METHODS = ['upi', 'card', 'netbanking', 'wallet', 'cod'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const RIDER_STATUSES = ['offline', 'online', 'busy'] as const;
export type RiderStatus = (typeof RIDER_STATUSES)[number];

/** Socket.IO event names — single source of truth shared (conceptually) with clients. */
export const SOCKET_EVENTS = {
  // rooms
  JOIN: 'join',
  // server -> clients
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_STATUS: 'order:status',
  RIDER_LOCATION: 'rider:location',
  RIDER_ASSIGNED: 'rider:assigned',
  NOTIFICATION: 'notification',
} as const;
