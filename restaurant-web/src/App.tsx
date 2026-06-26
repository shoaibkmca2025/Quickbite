import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/auth';
import { Toaster } from './components/Toaster';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { Menu } from './pages/Menu';
import { Earnings } from './pages/Earnings';
import { AdminConsole } from './pages/AdminConsole';

function Protected({ children, roles }: { children: JSX.Element; roles?: string[] }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const init = useAuth((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Protected roles={['restaurant']}><Dashboard /></Protected>} />
        <Route path="/orders" element={<Protected roles={['restaurant']}><Orders /></Protected>} />
        <Route path="/menu" element={<Protected roles={['restaurant']}><Menu /></Protected>} />
        <Route path="/earnings" element={<Protected roles={['restaurant']}><Earnings /></Protected>} />
        <Route path="/admin" element={<Protected roles={['admin']}><AdminConsole /></Protected>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
