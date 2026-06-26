import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { api } from '../lib/api';
import { inr } from '../lib/format';
import { useToasts } from '../store/toast';
import type { MenuItem } from '../lib/types';

interface MenuResponse {
  items: MenuItem[];
  stats: { total: number; available: number; soldOut: number };
}

const empty = { name: '', description: '', price: 0, category: 'Mains', isVeg: true, available: true, image: '' };

export function Menu() {
  const [data, setData] = useState<MenuResponse | null>(null);
  const [editing, setEditing] = useState<Partial<MenuItem> | null>(null);
  const push = useToasts((s) => s.push);

  const load = () => api.get<MenuResponse>('/menu/mine').then((r) => setData(r.data)).catch(() => {});
  useEffect(() => {
    load();
  }, []);

  const toggle = async (item: MenuItem) => {
    setData((d) => d && { ...d, items: d.items.map((i) => (i._id === item._id ? { ...i, available: !i.available } : i)) });
    try {
      await api.patch(`/menu/${item._id}/availability`, { available: !item.available });
    } catch {
      load();
    }
  };

  const save = async (item: Partial<MenuItem>) => {
    try {
      if (item._id) await api.patch(`/menu/${item._id}`, item);
      else await api.post('/menu', item);
      push('Menu saved', 'success');
      setEditing(null);
      load();
    } catch (e) {
      push(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const remove = async (item: MenuItem) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    await api.del(`/menu/${item._id}`);
    push('Item deleted', 'success');
    load();
  };

  const byCategory = (data?.items ?? []).reduce<Record<string, MenuItem[]>>((acc, it) => {
    (acc[it.category] ??= []).push(it);
    return acc;
  }, {});

  return (
    <Layout title="Menu Management">
      <div className="between" style={{ marginBottom: 20 }}>
        <button className="btn primary" onClick={() => setEditing({ ...empty })}>
          <Plus size={18} /> New Item
        </button>
        <div className="card row" style={{ padding: '12px 20px', gap: 28 }}>
          <Stat label="Total" value={data?.stats.total ?? 0} />
          <Stat label="Available" value={data?.stats.available ?? 0} color="var(--success)" />
          <Stat label="Sold Out" value={data?.stats.soldOut ?? 0} color="var(--danger)" />
        </div>
      </div>

      {Object.entries(byCategory).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 28 }}>
          <h3 className="muted" style={{ textTransform: 'uppercase', letterSpacing: '.05em', fontSize: 13, marginBottom: 12 }}>
            {cat}
          </h3>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {items.map((item) => (
              <div key={item._id} className="card" style={{ overflow: 'hidden', opacity: item.available ? 1 : 0.7 }}>
                <div style={{ height: 150, background: '#f1f0ee', position: 'relative' }}>
                  {item.image && (
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  <span
                    className={`badge ${item.available ? 'new' : 'cancelled'}`}
                    style={{ position: 'absolute', top: 10, right: 10 }}
                  >
                    {item.available ? 'Available' : 'Sold Out'}
                  </span>
                </div>
                <div className="card-pad">
                  <div className="between">
                    <b>{item.name}</b>
                    <span style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>{inr(item.price)}</span>
                  </div>
                  <p className="muted" style={{ fontSize: 13, margin: '6px 0 12px', minHeight: 34 }}>
                    {item.description}
                  </p>
                  <div className="between">
                    <div className="row">
                      <button className="btn ghost sm" onClick={() => setEditing(item)}><Pencil size={15} /></button>
                      <button className="btn ghost sm" onClick={() => remove(item)}><Trash2 size={15} /></button>
                    </div>
                    <button className={`toggle ${item.available ? 'on' : ''}`} onClick={() => toggle(item)}>
                      <span className="knob" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {editing && <ItemModal item={editing} onClose={() => setEditing(null)} onSave={save} />}
    </Layout>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

function ItemModal({
  item,
  onClose,
  onSave,
}: {
  item: Partial<MenuItem>;
  onClose: () => void;
  onSave: (i: Partial<MenuItem>) => void;
}) {
  const [form, setForm] = useState<Partial<MenuItem>>(item);
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'grid', placeItems: 'center', zIndex: 500, padding: 20 }}
      onClick={onClose}
    >
      <div className="card card-pad" style={{ width: 460, maxWidth: '100%' }} onClick={(e) => e.stopPropagation()}>
        <h2 className="section-title" style={{ marginBottom: 16 }}>{form._id ? 'Edit Item' : 'New Item'}</h2>
        <div className="field">
          <label>Name</label>
          <input className="input" value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea className="input" rows={2} value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="row" style={{ gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Price (₹)</label>
            <input className="input" type="number" value={form.price ?? 0} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Category</label>
            <input className="input" value={form.category ?? ''} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
        </div>
        <div className="field">
          <label>Image URL</label>
          <input className="input" value={form.image ?? ''} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        </div>
        <div className="row" style={{ margin: '6px 0 18px', gap: 18 }}>
          <label className="row" style={{ gap: 8, fontSize: 14 }}>
            <input type="checkbox" checked={form.isVeg ?? true} onChange={(e) => setForm({ ...form, isVeg: e.target.checked })} /> Veg
          </label>
          <label className="row" style={{ gap: 8, fontSize: 14 }}>
            <input type="checkbox" checked={form.available ?? true} onChange={(e) => setForm({ ...form, available: e.target.checked })} /> Available
          </label>
        </div>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={() => onSave(form)} disabled={!form.name || !form.price}>Save</button>
        </div>
      </div>
    </div>
  );
}
