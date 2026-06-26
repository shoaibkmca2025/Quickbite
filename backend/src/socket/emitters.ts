import { getIO, rooms } from './index';
import { SOCKET_EVENTS } from '../utils/constants';
import { logger } from '../config/logger';

/**
 * Thin, typed wrappers around io.emit so services don't depend on socket internals.
 * Each one is defensive: if sockets aren't ready (e.g. during seeding) it no-ops.
 */
function safeEmit(room: string, event: string, payload: unknown) {
  try {
    getIO().to(room).emit(event, payload);
  } catch (err) {
    logger.debug(`socket emit skipped (${event})`, err);
  }
}

export const realtime = {
  /** New order placed -> notify the restaurant portal (PRD FR-RST-02) + admin board. */
  orderCreated(restaurantId: string, order: unknown) {
    safeEmit(rooms.restaurant(restaurantId), SOCKET_EVENTS.ORDER_CREATED, order);
    safeEmit(rooms.admin(), SOCKET_EVENTS.ORDER_CREATED, order);
  },

  /** Any order field changed -> push the fresh order to everyone watching it. */
  orderUpdated(order: { _id: unknown; restaurant: unknown; customer: unknown; rider?: unknown }) {
    const id = String(order._id);
    safeEmit(rooms.order(id), SOCKET_EVENTS.ORDER_UPDATED, order);
    safeEmit(rooms.user(String(order.customer)), SOCKET_EVENTS.ORDER_UPDATED, order);
    safeEmit(rooms.restaurant(String(order.restaurant)), SOCKET_EVENTS.ORDER_UPDATED, order);
    if (order.rider) safeEmit(rooms.rider(String(order.rider)), SOCKET_EVENTS.ORDER_UPDATED, order);
    safeEmit(rooms.admin(), SOCKET_EVENTS.ORDER_UPDATED, order);
  },

  /** Lightweight status ping for the customer's tracking screen. */
  orderStatus(orderId: string, status: string, etaAt?: Date) {
    safeEmit(rooms.order(orderId), SOCKET_EVENTS.ORDER_STATUS, { orderId, status, etaAt });
  },

  /** Rider assigned -> notify the rider so the assignment appears on their phone. */
  riderAssigned(riderId: string, order: unknown) {
    safeEmit(rooms.rider(riderId), SOCKET_EVENTS.RIDER_ASSIGNED, order);
  },

  /** Generic notification toast for a specific user. */
  notify(userId: string, payload: { title: string; body?: string; type?: string }) {
    safeEmit(rooms.user(userId), SOCKET_EVENTS.NOTIFICATION, payload);
  },
};
