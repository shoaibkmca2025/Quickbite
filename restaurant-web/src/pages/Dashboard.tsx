import { useEffect, useState } from 'react';
import { ShoppingBag, IndianRupee, Timer, Check, X } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useLiveOrders } from '../hooks/useLiveOrders';
import { api } from '../lib/api';
import { inr, countdown, statusLabel, timeAgo } from '../lib/format';
import { useToasts } from '../store/toast';
import type { Order } from '../lib/types';

interface Stats {
  todayOrders: number;
  todayRevenue: number;
  activeOrders: number;
  avgPrepTimeMins: number;
}

export function Dashboard() {
  const { orders, refresh } = useLiveOrders('active');
  const [stats, setStats] = useState<Stats | null>(null);
  const push = useToasts((s) => s.push);
  const [, force] = useState(0);

  useEffect(() => {
    api.get<Stats>('/restaurants/me/dashboard').then((r) => setStats(r.data)).catch(() => {});
  }, [orders.length]);

  // Tick every second so countdowns stay live.
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const incoming = orders.filter((o) => o.status === 'placed');
  const inProgress = orders.filter((o) => o.status !== 'placed');

  const act = async (order: Order, action: 'accept' | 'reject' | 'status', body?: object) => {
    try {
      await api.post(`/orders/${order._id}/${action}`, body);
      push(`Order ${order.code} updated`, 'success');
      refresh();
      api.get<Stats>('/restaurants/me/dashboard').then((r) => setStats(r.data));
    } catch (e) {
      push(e instanceof Error ? e.message : 'Action failed');
    }
  };

  const nextAction = (o: Order) => {
    if (o.status === 'accepted') return { label: 'Start Prep', fn: () => act(o, 'status', { status: 'preparing' }) };
    if (o.status === 'preparing') return { label: 'Ready for Pickup', fn: () => act(o, 'status', { status: 'ready' }) };
    return null;
  };

  return (
    <Layout title="Partner Portal">
      <div className="grid stat-grid" style={{ marginBottom: 24 }}>
        <StatCard
          label="Today's Orders"
          value={stats?.todayOrders ?? '—'}
          delta="live"
          icon={<ShoppingBag size={22} />}
        />
        <StatCard
          label="Revenue (net)"
          value={inr(stats?.todayRevenue)}
          delta="after commission"
          icon={<IndianRupee size={22} />}
        />
        <StatCard
          label="Avg Prep Time"
          value={`${stats?.avgPrepTimeMins ?? 0}m`}
          delta={`${stats?.activeOrders ?? 0} active`}
          icon={<Timer size={22} />}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
        {/* Live orders table */}
        <div className="card">
          <div className="between card-pad" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="row">
              <h2 className="section-title">Live Orders</h2>
              <span className="badge accepted">{inProgress.length} active</span>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Items</th>
                  <th>Customer</th>
                  <th>ETA</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {inProgress.length === 0 && (
                  <tr>
                    <td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 36 }}>
                      No active orders. New orders will appear here instantly.
                    </td>
                  </tr>
                )}
                {inProgress.map((o) => {
                  const action = nextAction(o);
                  return (
                    <tr key={o._id}>
                      <td className="code">#{o.code}</td>
                      <td style={{ maxWidth: 200 }}>
                        {o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                      </td>
                      <td>{o.customer?.name ?? 'Guest'}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{countdown(o.etaAt)}</td>
                      <td>
                        <span className={`badge ${o.status}`}>{statusLabel(o.status)}</span>
                      </td>
                      <td>
                        {action ? (
                          <button className="btn accent sm" onClick={action.fn}>
                            {action.label}
                          </button>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Incoming panel */}
        <div className="card card-pad">
          <h2 className="section-title" style={{ marginBottom: 14 }}>Incoming</h2>
          {incoming.length === 0 && <p className="muted" style={{ fontSize: 14 }}>Waiting for new orders…</p>}
          {incoming.map((o) => (
            <div key={o._id} className="card" style={{ border: '2px solid var(--primary)', marginBottom: 14, padding: 16 }}>
              <div className="between">
                <b>Order #{o.code}</b>
                <span className="muted" style={{ fontSize: 12 }}>{timeAgo(o.placedAt ?? o.createdAt)}</span>
              </div>
              <div style={{ margin: '10px 0' }}>
                {o.items.map((i, idx) => (
                  <div key={idx} className="between" style={{ fontSize: 14, padding: '3px 0' }}>
                    <span>{i.quantity}× {i.name}</span>
                    <span>{inr(i.lineTotal)}</span>
                  </div>
                ))}
              </div>
              <div className="between" style={{ fontWeight: 700, marginBottom: 12 }}>
                <span>You earn</span>
                <span>{inr(o.restaurantEarning)}</span>
              </div>
              <div className="row">
                <button className="btn success sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => act(o, 'accept', { prepTimeMins: 20 })}>
                  <Check size={16} /> Accept
                </button>
                <button className="btn ghost sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => act(o, 'reject', { reason: 'Unable to fulfil' })}>
                  <X size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ label, value, delta, icon }: { label: string; value: string | number; delta: string; icon: React.ReactNode }) {
  return (
    <div className="card stat-card">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-delta">{delta}</div>
      </div>
      <div className="stat-icon">{icon}</div>
    </div>
  );
}
