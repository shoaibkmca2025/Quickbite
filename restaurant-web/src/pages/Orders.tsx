import { useEffect, useMemo, useState } from 'react';
import { Phone, Check, X, Printer } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useLiveOrders } from '../hooks/useLiveOrders';
import { api } from '../lib/api';
import { inr, statusLabel, clockTime, timeAgo } from '../lib/format';
import { useToasts } from '../store/toast';
import type { Order } from '../lib/types';

const TIMELINE: { key: string; label: string }[] = [
  { key: 'placed', label: 'Order Received' },
  { key: 'accepted', label: 'Accepted by Kitchen' },
  { key: 'preparing', label: 'Preparing Food' },
  { key: 'ready', label: 'Ready for Pickup' },
  { key: 'picked_up', label: 'Picked up by Rider' },
  { key: 'delivered', label: 'Delivered' },
];

const ORDER_RANK: Record<string, number> = {
  placed: 0,
  accepted: 1,
  preparing: 2,
  ready: 3,
  assigned: 3,
  picked_up: 4,
  out_for_delivery: 4,
  delivered: 5,
};

export function Orders() {
  const [group, setGroup] = useState<'active' | 'completed'>('active');
  const { orders, refresh } = useLiveOrders(group);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const push = useToasts((s) => s.push);

  useEffect(() => {
    if (!selectedId && orders.length) setSelectedId(orders[0]._id);
  }, [orders, selectedId]);

  const selected = useMemo(() => orders.find((o) => o._id === selectedId) ?? null, [orders, selectedId]);

  const act = async (order: Order, action: string, body?: object) => {
    try {
      await api.post(`/orders/${order._id}/${action}`, body);
      push(`Order ${order.code} updated`, 'success');
      refresh();
    } catch (e) {
      push(e instanceof Error ? e.message : 'Action failed');
    }
  };

  const primaryAction = (o: Order) => {
    switch (o.status) {
      case 'placed':
        return { label: 'Accept Order', cls: 'success', fn: () => act(o, 'accept', { prepTimeMins: 20 }) };
      case 'accepted':
        return { label: 'Start Preparing', cls: 'accent', fn: () => act(o, 'status', { status: 'preparing' }) };
      case 'preparing':
        return { label: 'Mark Order Ready', cls: 'accent', fn: () => act(o, 'status', { status: 'ready' }) };
      default:
        return null;
    }
  };

  return (
    <Layout title="Orders">
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 18, alignItems: 'start' }}>
        {/* List */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="card-pad" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="tabs">
              <button className={`tab ${group === 'active' ? 'active' : ''}`} onClick={() => { setGroup('active'); setSelectedId(null); }}>
                Active
              </button>
              <button className={`tab ${group === 'completed' ? 'active' : ''}`} onClick={() => { setGroup('completed'); setSelectedId(null); }}>
                Completed
              </button>
            </div>
          </div>
          <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
            {orders.length === 0 && <p className="muted" style={{ padding: 24 }}>No orders here yet.</p>}
            {orders.map((o) => (
              <button
                key={o._id}
                onClick={() => setSelectedId(o._id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', border: 'none',
                  borderBottom: '1px solid var(--border)', background: o._id === selectedId ? 'var(--primary-container)' : '#fff',
                  padding: 16,
                }}
              >
                <div className="between">
                  <span className="code">#{o.code}</span>
                  <span className={`badge ${o.status}`}>{statusLabel(o.status)}</span>
                </div>
                <div style={{ fontWeight: 700, margin: '6px 0 2px' }}>{o.customer?.name ?? 'Guest'}</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  {o.items.length} item{o.items.length > 1 ? 's' : ''} • {inr(o.grandTotal)} • {timeAgo(o.createdAt)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        {selected ? (
          <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
            <div className="card card-pad between">
              <div>
                <span className={`badge ${selected.status}`}>{statusLabel(selected.status)}</span>
                <h2 className="section-title" style={{ marginTop: 8 }}>Order #{selected.code}</h2>
                <p className="muted" style={{ fontSize: 13 }}>
                  Placed {clockTime(selected.placedAt ?? selected.createdAt)}
                </p>
              </div>
              <button className="btn ghost sm"><Printer size={16} /> Print</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
              {/* Left column */}
              <div className="grid" style={{ gap: 16 }}>
                <div className="card card-pad">
                  <div className="between" style={{ marginBottom: 12 }}>
                    <b>Customer</b>
                    {selected.customer?.phone && (
                      <span className="row" style={{ color: 'var(--primary-dark)', fontSize: 14, fontWeight: 600 }}>
                        <Phone size={15} /> {selected.customer.phone}
                      </span>
                    )}
                  </div>
                  <div style={{ fontWeight: 700 }}>{selected.customer?.name}</div>
                  {selected.deliveryAddress && (
                    <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>
                      {selected.deliveryAddress.line}, {selected.deliveryAddress.city} {selected.deliveryAddress.pincode}
                    </div>
                  )}
                  {selected.deliveryAddress?.instructions && (
                    <div style={{ background: 'var(--warn-bg)', color: 'var(--warn-text)', padding: 10, borderRadius: 10, marginTop: 10, fontSize: 13 }}>
                      Note: {selected.deliveryAddress.instructions}
                    </div>
                  )}
                </div>

                <div className="card card-pad">
                  <b>Order Summary ({selected.items.length} items)</b>
                  <div style={{ marginTop: 12 }}>
                    {selected.items.map((it, idx) => (
                      <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                        <div className="between">
                          <span style={{ fontWeight: 600 }}>{it.quantity}× {it.name}</span>
                          <span>{inr(it.lineTotal)}</span>
                        </div>
                        {it.options && it.options.length > 0 && (
                          <div className="muted" style={{ fontSize: 13 }}>
                            {it.options.map((o) => o.label).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="grid" style={{ gap: 16 }}>
                <div className="card card-pad">
                  <b>Order Status</b>
                  <div style={{ marginTop: 14 }}>
                    {TIMELINE.map((step) => {
                      const rank = ORDER_RANK[selected.status] ?? 0;
                      const stepRank = ORDER_RANK[step.key] ?? 0;
                      const done = stepRank <= rank;
                      const evt = selected as unknown as { statusHistory?: { status: string; at: string }[] };
                      const at = evt.statusHistory?.find((s) => s.status === step.key)?.at;
                      return (
                        <div key={step.key} className="row" style={{ alignItems: 'flex-start', marginBottom: 14 }}>
                          <span
                            style={{
                              width: 12, height: 12, borderRadius: '50%', marginTop: 4,
                              background: done ? 'var(--success)' : '#cbd5e1', flexShrink: 0,
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: done ? 700 : 500, color: done ? 'var(--text)' : 'var(--muted)' }}>
                              {step.label}
                            </div>
                            {at && <div className="muted" style={{ fontSize: 12 }}>{clockTime(at)}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="card card-pad">
                  <b>Payment Details</b>
                  <div style={{ marginTop: 10, fontSize: 14 }}>
                    <Row label="Subtotal" value={inr(selected.itemTotal)} />
                    <Row label="Taxes" value={inr(selected.tax)} />
                    <Row label="Delivery" value={inr(selected.deliveryFee)} />
                    {selected.discount > 0 && <Row label="Discount" value={`- ${inr(selected.discount)}`} />}
                    <Row label="Commission" value={`- ${inr(selected.commission)}`} danger />
                    <div className="between" style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 10, fontWeight: 800 }}>
                      <span>Total Earning</span>
                      <span style={{ color: 'var(--primary-dark)' }}>{inr(selected.restaurantEarning)}</span>
                    </div>
                    <div className="muted" style={{ fontSize: 13, marginTop: 8 }}>
                      Paid via {selected.paymentMethod.toUpperCase()} ({selected.paymentStatus})
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card card-pad row" style={{ justifyContent: 'flex-end' }}>
              {selected.status === 'placed' && (
                <button className="btn ghost" onClick={() => act(selected, 'reject', { reason: 'Unable to fulfil' })}>
                  <X size={16} /> Reject
                </button>
              )}
              {(() => {
                const a = primaryAction(selected);
                return a ? (
                  <button className={`btn ${a.cls}`} onClick={a.fn}>
                    <Check size={16} /> {a.label}
                  </button>
                ) : (
                  <span className="muted">No further action required.</span>
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="card card-pad center" style={{ minHeight: 300 }}>
            <span className="muted">Select an order to view details</span>
          </div>
        )}
      </div>
    </Layout>
  );
}

function Row({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="between" style={{ padding: '4px 0' }}>
      <span className="muted">{label}</span>
      <span style={{ color: danger ? 'var(--danger)' : 'inherit' }}>{value}</span>
    </div>
  );
}
