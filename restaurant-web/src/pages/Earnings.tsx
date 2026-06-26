import { useEffect, useState } from 'react';
import { Wallet, CheckCircle2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { api } from '../lib/api';
import { inr } from '../lib/format';

interface EarningsData {
  pendingPayout: number;
  lastPayout: number;
  history: { date: string; orderCount: number; grossRevenue: number; payoutStatus: string }[];
  revenueTrend: { date: string; grossRevenue: number }[];
}

export function Earnings() {
  const [data, setData] = useState<EarningsData | null>(null);

  useEffect(() => {
    api.get<EarningsData>('/restaurants/me/earnings').then((r) => setData(r.data)).catch(() => {});
  }, []);

  const max = Math.max(1, ...(data?.revenueTrend ?? []).map((d) => d.grossRevenue));

  return (
    <Layout title="Earnings">
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18, marginBottom: 20 }}>
        <div className="card card-pad between">
          <div>
            <div className="stat-label">Pending Payout</div>
            <div className="stat-value">{inr(data?.pendingPayout)}</div>
            <div className="stat-delta">Next payout scheduled weekly</div>
            <div className="row" style={{ marginTop: 16 }}>
              <button className="btn primary">Request Early Payout</button>
              <button className="btn ghost">View Breakdown</button>
            </div>
          </div>
          <div className="stat-icon" style={{ width: 56, height: 56 }}><Wallet size={26} /></div>
        </div>

        <div className="card card-pad" style={{ background: 'var(--primary)', color: '#fff' }}>
          <div style={{ opacity: 0.9, fontSize: 12, letterSpacing: '.05em' }}>LAST PAYOUT</div>
          <div style={{ fontSize: 30, fontWeight: 800, margin: '8px 0' }}>{inr(data?.lastPayout)}</div>
          <div className="row" style={{ opacity: 0.95, fontSize: 14 }}>
            <CheckCircle2 size={16} /> Successfully processed
          </div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <h3 className="section-title">Revenue Trends</h3>
        <p className="muted" style={{ fontSize: 13 }}>Daily gross revenue (last 7 days)</p>
        <div className="bars">
          {(data?.revenueTrend ?? []).map((d) => (
            <div className="bar-col" key={d.date}>
              <div className="bar" style={{ height: `${(d.grossRevenue / max) * 100}%` }} title={inr(d.grossRevenue)} />
              <div className="bar-label">{new Date(d.date).toLocaleDateString('en', { weekday: 'short' })}</div>
            </div>
          ))}
          {(!data || data.revenueTrend.length === 0) && <p className="muted">No revenue yet.</p>}
        </div>
      </div>

      <div className="card">
        <div className="card-pad" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="section-title">Earnings History</h3>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Order Count</th>
              <th>Gross Revenue</th>
              <th>Payout Status</th>
            </tr>
          </thead>
          <tbody>
            {(data?.history ?? []).map((h) => (
              <tr key={h.date}>
                <td>{new Date(h.date).toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td>{h.orderCount}</td>
                <td style={{ fontWeight: 700 }}>{inr(h.grossRevenue)}</td>
                <td>
                  <span className={`badge ${h.payoutStatus === 'paid' ? 'delivered' : 'new'}`}>{h.payoutStatus}</span>
                </td>
              </tr>
            ))}
            {(!data || data.history.length === 0) && (
              <tr><td colSpan={4} className="muted" style={{ textAlign: 'center', padding: 30 }}>No earnings history yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
