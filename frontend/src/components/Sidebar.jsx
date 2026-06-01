import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../theme';

const links = [
  { to: '/',        label: 'Dashboard' },
  { to: '/clients', label: 'Clients'   },
  { to: '/sales',   label: 'Sales'     },
  { to: '/tasks',   label: 'Tasks'     },
];

const initials = name => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

const Sidebar = () => {
  const { user } = useAuth();
  const { dark } = useTheme();
  const t = themes[dark ? 'dark' : 'light'];

  return (
    <aside style={{ width: '210px', minHeight: '100vh', background: t.surface, borderRight: '0.5px solid ' + t.border, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

      <div style={{ padding: '18px 20px', borderBottom: '0.5px solid ' + t.border }}>
        <div style={{ fontSize: '16px', fontWeight: '600', color: t.textPrimary, letterSpacing: '-.3px' }}>
          Crm<span style={{ color: '#6366f1' }}>Agency</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px' }}>
        <div style={{ fontSize: '10px', color: t.textMuted, fontWeight: '600', letterSpacing: '.08em', padding: '8px 10px 6px', textTransform: 'uppercase' }}>Main</div>
        {links.map(link => (
          <NavLink key={link.to} to={link.to} end={link.to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px',
              fontSize: '13px', borderRadius: '8px', marginBottom: '2px', textDecoration: 'none', transition: 'all .15s',
              background: isActive ? t.navActive    : 'transparent',
              color:      isActive ? t.navActiveTxt : t.navTxt,
              fontWeight: isActive ? '500'          : '400',
            })}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', opacity: .6, flexShrink: 0 }} />
            {link.label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div style={{ fontSize: '10px', color: t.textMuted, fontWeight: '600', letterSpacing: '.08em', padding: '16px 10px 6px', textTransform: 'uppercase' }}>Admin</div>
            <NavLink to="/admin/users"
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px',
                fontSize: '13px', borderRadius: '8px', marginBottom: '2px', textDecoration: 'none',
                background: isActive ? t.navActive    : 'transparent',
                color:      isActive ? t.navActiveTxt : t.navTxt,
                fontWeight: isActive ? '500'          : '400',
              })}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', opacity: .6, flexShrink: 0 }} />
              Users & Teams
            </NavLink>
          </>
        )}
      </nav>

      <div style={{ padding: '12px 16px', borderTop: '0.5px solid ' + t.border }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', color: '#fff', flexShrink: 0 }}>
            {initials(user?.name)}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '500', color: t.textPrimary }}>{user?.name}</div>
            <div style={{ fontSize: '11px', color: t.textMuted, textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;