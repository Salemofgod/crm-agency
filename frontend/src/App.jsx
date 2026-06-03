import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { themes } from './theme';
import { useAuth } from './context/AuthContext';
import { useState, useEffect } from 'react';
import api from './api/api';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import Sidebar   from './components/Sidebar';
import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients   from './pages/Clients';
import Sales     from './pages/Sales';
import Tasks     from './pages/Tasks';
import Users     from './pages/admin/Users';

const Topbar = () => {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const t = themes[dark ? 'dark' : 'light'];
  const [notifs,     setNotifs]     = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUser,   setShowUser]   = useState(false);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'SG';

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/tasks');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const alerts = [];
        res.data.forEach(task => {
          if (task.status === 'done' || !task.due_date) return;
          const due = new Date(task.due_date);
          due.setHours(0, 0, 0, 0);
          const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));
          if (diffDays < 0) {
            alerts.push({
              message: '⚠️ ' + task.title + ' — overdue by ' + Math.abs(diffDays) + ' day(s)',
              type: 'error'
            });
          } else if (diffDays <= 2) {
            alerts.push({
              message: '🔔 ' + task.title + ' — due in ' + diffDays + ' day(s)',
              type: 'warning'
            });
          }
        });
        setNotifs(alerts);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifs();
    const iv = setInterval(fetchNotifs, 60000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ height: '56px', background: t.surface, borderBottom: '0.5px solid ' + t.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ fontSize: '13px', color: t.textMuted }}>
        Welcome back, <span style={{ color: t.textPrimary, fontWeight: '500' }}>{user?.name}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: t.textSecond, padding: '4px' }}>
          {dark ? '☀' : '☾'}
        </button>

        <div style={{ position: 'relative' }}>
          <button onClick={() => { setShowNotifs(!showNotifs); setShowUser(false); }} style={{ background: t.bg, border: '0.5px solid ' + t.border, borderRadius: '8px', cursor: 'pointer', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px', color: t.textSecond, fontSize: '12px' }}>
            Notifications
            {notifs.length > 0 && (
              <span style={{ background: '#f87171', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '20px' }}>
                {notifs.length}
              </span>
            )}
          </button>
          {showNotifs && (
            <div style={{ position: 'absolute', top: '42px', right: '0', width: '300px', background: t.surface, border: '0.5px solid ' + t.border, borderRadius: '10px', padding: '12px', zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '10px' }}>Notifications</div>
              {notifs.length === 0 && <p style={{ fontSize: '12px', color: t.textMuted, textAlign: 'center', padding: '12px' }}>No alerts</p>}
              {notifs.map((n, i) => (
                <div key={i} style={{ padding: '8px 10px', borderRadius: '6px', marginBottom: '6px', fontSize: '12px', lineHeight: '1.4', background: n.type === 'error' ? '#3b0f0f' : '#3b2100', color: n.type === 'error' ? '#f87171' : '#f59e0b' }}>
                  {n.message}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button onClick={() => { setShowUser(!showUser); setShowNotifs(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: t.bg, border: '0.5px solid ' + t.border, borderRadius: '8px', padding: '6px 10px', cursor: 'pointer' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '600', color: '#fff' }}>
              {initials}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: '500', color: t.textPrimary }}>{user?.name}</div>
              <div style={{ fontSize: '10px', color: t.textMuted, textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </button>

          {showUser && (
            <div style={{ position: 'absolute', top: '48px', right: '0', width: '200px', background: t.surface, border: '0.5px solid ' + t.border, borderRadius: '10px', padding: '8px', zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
              <div style={{ padding: '10px 12px', borderBottom: '0.5px solid ' + t.border, marginBottom: '6px' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: t.textPrimary }}>{user?.name}</div>
                <div style={{ fontSize: '11px', color: t.textMuted }}>{user?.email}</div>
                <div style={{ fontSize: '11px', color: '#818cf8', textTransform: 'capitalize', marginTop: '2px' }}>{user?.role}</div>
              </div>
              <button onClick={logout} style={{ width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', borderRadius: '6px', fontSize: '13px', color: '#f87171', cursor: 'pointer', textAlign: 'left' }}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Layout = ({ children }) => {
  const { dark } = useTheme();
  const t = themes[dark ? 'dark' : 'light'];
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.bg }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Topbar />
        <main style={{ flex: 1, padding: '28px 32px', background: t.bg }}>
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/clients" element={<ProtectedRoute><Layout><Clients /></Layout></ProtectedRoute>} />
      <Route path="/sales" element={<ProtectedRoute><Layout><Sales /></Layout></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><Layout><Tasks /></Layout></ProtectedRoute>} />
      <Route path="/admin/users" element={<RoleBasedRoute roles={['admin']}><Layout><Users /></Layout></RoleBasedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </ThemeProvider>
);

export default App;
