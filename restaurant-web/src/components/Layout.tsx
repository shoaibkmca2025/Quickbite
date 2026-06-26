import { NavLink, useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';
import {
  LayoutGrid,
  ClipboardList,
  UtensilsCrossed,
  Wallet,
  LogOut,
  Bell,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../store/auth';
import type { Restaurant } from '../lib/types';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
  { to: '/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/earnings', label: 'Earnings', icon: Wallet },
];

export function Layout({ title, children }: { title: string; children: ReactNode }) {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const isAdmin = user?.role === 'admin';
  const restaurant = typeof user?.restaurant === 'object' ? (user.restaurant as Restaurant) : null;

  const items = isAdmin
    ? [{ to: '/admin', label: 'Ops Console', icon: ShieldCheck }]
    : navItems;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">🍴</div>
          <div>
            <div className="brand-name">{restaurant?.name ?? 'QuickBite'}</div>
            <div className="brand-sub">Partner ID: #{restaurant?.partnerId ?? '—'}</div>
          </div>
        </div>
        {!isAdmin && (
          <div className="status-pill">
            <span className="dot" />
            Status: {restaurant?.isOpen ? 'Open' : 'Closed'}
          </div>
        )}

        <nav className="nav">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-foot">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogOut size={20} /> Log Out
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <h1>{title}</h1>
          <div className="spacer" />
          <div className="search">
            <Search size={16} className="muted" />
            <input placeholder="Search orders, dishes…" />
          </div>
          <Bell size={20} className="muted" />
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#ddd',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700,
            }}
          >
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
