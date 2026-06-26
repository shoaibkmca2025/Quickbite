import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';
import { useToasts } from '../store/toast';
import type { Order } from '../lib/types';

/**
 * Loads the restaurant's orders for a status group and keeps them in sync via
 * Socket.IO — new orders appear instantly (PRD FR-RST-02) and status changes
 * update in place without polling.
 */
export function useLiveOrders(group: 'active' | 'completed' | 'all' = 'active') {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const push = useToasts((s) => s.push);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get<Order[]>(`/orders/restaurant?group=${group}&limit=100`);
      setOrders(res.data);
    } catch {
      /* handled by interceptor */
    } finally {
      setLoading(false);
    }
  }, [group]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const socket = getSocket();

    const onCreated = (order: Order) => {
      push(`New order ${order.code} received!`, 'success');
      try {
        new Audio(
          'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ=='
        ).play().catch(() => {});
      } catch {
        /* ignore audio errors */
      }
      setOrders((prev) => (prev.some((o) => o._id === order._id) ? prev : [order, ...prev]));
    };

    const onUpdated = (order: Order) => {
      setOrders((prev) => {
        const exists = prev.some((o) => o._id === order._id);
        const stillRelevant =
          group === 'all' ||
          (group === 'active'
            ? !['delivered', 'cancelled', 'rejected', 'pending_payment'].includes(order.status)
            : ['delivered', 'cancelled', 'rejected'].includes(order.status));
        if (!stillRelevant) return prev.filter((o) => o._id !== order._id);
        if (exists) return prev.map((o) => (o._id === order._id ? order : o));
        return [order, ...prev];
      });
    };

    socket.on('order:created', onCreated);
    socket.on('order:updated', onUpdated);
    return () => {
      socket.off('order:created', onCreated);
      socket.off('order:updated', onUpdated);
    };
  }, [group, push]);

  return { orders, loading, refresh, setOrders };
}
