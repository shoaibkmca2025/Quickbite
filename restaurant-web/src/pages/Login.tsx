import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { useToasts } from '../store/toast';

export function Login() {
  const navigate = useNavigate();
  const { login, registerRestaurant, user } = useAuth();
  const push = useToasts((s) => s.push);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [busy, setBusy] = useState(false);

  // login fields
  const [email, setEmail] = useState('owner@quickbite.test');
  const [password, setPassword] = useState('owner123');

  // register fields
  const [reg, setReg] = useState({
    ownerName: '',
    email: '',
    password: '',
    name: '',
    cuisines: '',
    address: '',
    city: 'Bengaluru',
    pincode: '',
  });

  if (user) {
    navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
  }

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      const role = useAuth.getState().user?.role;
      navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      push(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await registerRestaurant({
        ...reg,
        cuisines: reg.cuisines.split(',').map((c) => c.trim()).filter(Boolean),
      });
      push('Restaurant submitted — pending approval. You can log in once approved.', 'success');
      setMode('login');
    } catch (err) {
      push(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)', padding: 20 }}>
      <div className="card" style={{ width: 440, maxWidth: '100%', padding: 32 }}>
        <div className="row" style={{ marginBottom: 18 }}>
          <div className="brand-logo">🍴</div>
          <div>
            <div className="brand-name">QuickBite</div>
            <div className="brand-sub">Partner Portal</div>
          </div>
        </div>

        <div className="tabs" style={{ marginBottom: 22 }}>
          <button className={`tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>
            Log in
          </button>
          <button className={`tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>
            Register restaurant
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={onLogin}>
            <div className="field">
              <label>Email</label>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </div>
            <div className="field">
              <label>Password</label>
              <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </div>
            <button className="btn primary block" disabled={busy} type="submit">
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
            <p className="muted" style={{ fontSize: 13, marginTop: 16, lineHeight: 1.6 }}>
              Demo: <b>owner@quickbite.test / owner123</b> (restaurant)<br />
              Admin: <b>admin@quickbite.test / admin123</b>
            </p>
          </form>
        ) : (
          <form onSubmit={onRegister}>
            {([
              ['Restaurant name', 'name'],
              ['Owner name', 'ownerName'],
              ['Email', 'email'],
              ['Password', 'password'],
              ['Cuisines (comma separated)', 'cuisines'],
              ['Address', 'address'],
              ['City', 'city'],
              ['Pincode', 'pincode'],
            ] as const).map(([label, key]) => (
              <div className="field" key={key}>
                <label>{label}</label>
                <input
                  className="input"
                  type={key === 'password' ? 'password' : 'text'}
                  value={(reg as Record<string, string>)[key]}
                  onChange={(e) => setReg({ ...reg, [key]: e.target.value })}
                  required={['name', 'ownerName', 'email', 'password', 'address', 'city', 'pincode'].includes(key)}
                />
              </div>
            ))}
            <button className="btn primary block" disabled={busy} type="submit">
              {busy ? 'Submitting…' : 'Submit for approval'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
