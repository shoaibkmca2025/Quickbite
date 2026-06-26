import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';
import { inr, statusLabel, timeAgo } from '../lib/format';
import { useToasts } from '../store/toast';
import type { Order, Restaurant } from '../lib/types';

interface Overview {
  totalOrders: number;
  deliveredOrders: number;
  activeOrders: number;
  gmv: number;
  aov: number;
  liveRestaurants: number;
  activeRiders: number;
}

export function AdminConsole() {
  const [tab, setTab] = useState<'orders' | 'restaurants'>('orders');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const push = useToasts((s) => s.push);

  const loadOverview = () => api.get<Overview>('/admin/overview').then((r) => setOverview(r.data)).catch(() => {});
  const loadOrders = () => api.get<Order[]>('/admin/orders/live').then((r) => setOrders(r.data)).catch(() => {});
  const loadRestaurants = () => api.get<Restaurant[]>('/admin/restaurants').then((r) => setRestaurants(r.data)).catch(() => {});

  useEffect(() => {
    loadOverview();
    loadOrders();
    loadRestaurants();
    const socket = getSocket();
    const refresh = () => { loadOrders(); loadOverview(); };
    socket.on('order:created', refresh);
    socket.on('order:updated', refresh);
    return () => {
      socket.off('order:created', refresh);
      socket.off('order:updated', refresh);
    };
  }, []);

  const refund = async (o: Order) => {
    const reason = prompt(`Refund ${o.code}? Reason:`);
    if (!reason) return;
    try {
      await api.post(`/admin/orders/${o._id}/refund`, { reason });
      push('Refund initiated', 'success');
      loadOrders();
    } catch (e) {
      push(e instanceof Error ? e.message : 'Refund failed');
    }
  };

  const setApproval = async (r: Restaurant, isApproved: boolean) => {
    await api.patch(`/admin/restaurants/${r._id}`, { isApproved });
    push(`${r.name} ${isApproved ? 'approved' : 'suspended'}`, 'success');
    loadRestaurants();
  };

  return (
    <Layout title="Ops Console">
      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        <Kpi label="GMV" value={inr(overview?.gmv)} />
        <Kpi label="Active Orders" value={overview?.activeOrders ?? 0} />
        <Kpi label="AOV" value={inr(overview?.aov)} />
        <Kpi label="Live Restaurants" value={overview?.liveRestaurants ?? 0} />
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        <button className={`tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>Live Orders</button>
        <button className={`tab ${tab === 'restaurants' ? 'active' : ''}`} onClick={() => setTab('restaurants')}>Restaurants</button>
      </div>

      {tab === 'orders' ? (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th><th>Restaurant</th><th>Customer</th><th>Rider</th><th>Total</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="code">#{o.code}<div className="muted" style={{ fontSize: 12 }}>{timeAgo(o.createdAt)}</div></td>
                  <td>{(o as unknown as { restaurant?: { name?: string } }).restaurant?.name}</td>
                  <td>{o.customer?.name}</td>
                  <td>{o.rider?.name ?? <span className="muted">—</span>}</td>
                  <td>{inr(o.grandTotal)}</td>
                  <td><span className={`badge ${o.status}`}>{statusLabel(o.status)}</span></td>
                  <td>
                    {o.paymentStatus === 'paid' && (
                      <button className="btn ghost sm" onClick={() => refund(o)}>Refund</button>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={7} className="muted" style={{ textAlign: 'center', padding: 30 }}>No live orders.</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr><th>Restaurant</th><th>City</th><th>Rating</th><th>Approved</th><th>Action</th></tr>
            </thead>
            <tbody>
              {restaurants.map((r) => (
                <tr key={r._id}>
                  <td><b>{r.name}</b><div className="muted" style={{ fontSize: 12 }}>#{r.partnerId}</div></td>
                  <td>{r.city}</td>
                  <td>{r.rating}</td>
                  <td><span className={`badge ${r.isApproved ? 'delivered' : 'cancelled'}`}>{r.isApproved ? 'Approved' : 'Pending'}</span></td>
                  <td>
                    {r.isApproved ? (
                      <button className="btn ghost sm" onClick={() => setApproval(r, false)}>Suspend</button>
                    ) : (
                      <button className="btn success sm" onClick={() => setApproval(r, true)}>Approve</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card stat-card">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}
