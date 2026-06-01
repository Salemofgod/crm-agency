import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../theme';

const Login = () => {
  const { login, user } = useAuth();
  const { dark, toggle } = useTheme();
  const t = themes[dark ? 'dark' : 'light'];
  const navigate = useNavigate();
  const emailRef    = useRef();
  const passwordRef = useRef();
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  if (user) { navigate('/'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const email    = emailRef.current.value.replace(/^mailto:/i, '').trim();
    const password = passwordRef.current.value;
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: t.bg,
      position: 'relative',
    }}>
      <button
        onClick={toggle}
        style={{
          position: 'absolute',
          top: '20px',
          right: '24px',
          background: t.surface,
          border: '0.5px solid ' + t.border,
          borderRadius: '8px',
          padding: '8px 14px',
          fontSize: '13px',
          color: t.textSecond,
          cursor: 'pointer',
        }}
      >
        {dark ? '☀ Light mode' : '☾ Dark mode'}
      </button>

      <div style={{
        background: t.surface,
        border: '0.5px solid ' + t.border,
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '380px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{
            background: '#6366f1',
            color: '#fff',
            fontSize: '13px',
            fontWeight: '500',
            padding: '10px 16px',
            borderRadius: '10px',
          }}>
            CRM
          </div>
        </div>

        <h1 style={{
          fontSize: '20px',
          fontWeight: '500',
          color: t.textPrimary,
          textAlign: 'center',
          marginBottom: '4px',
        }}>
          Welcome back
        </h1>
        <p style={{
          fontSize: '13px',
          color: t.textMuted,
          textAlign: 'center',
          marginBottom: '28px',
        }}>
          Sign in to CrmAgency
        </p>

        {error && (
          <div style={{
            background: '#3b0f0f',
            border: '0.5px solid #7f1d1d',
            color: '#f87171',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              fontSize: '12px',
              fontWeight: '500',
              color: t.textSecond,
              textTransform: 'uppercase',
              letterSpacing: '.05em',
            }}>
              Email
            </label>
            <input
              ref={emailRef}
              type="text"
              defaultValue=""
              style={{
                padding: '10px 14px',
                background: t.inputBg,
                border: '0.5px solid ' + t.border,
                borderRadius: '8px',
                fontSize: '14px',
                color: t.textPrimary,
                outline: 'none',
              }}
              placeholder="you@agency.com"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              data-form-type="other"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{
              fontSize: '12px',
              fontWeight: '500',
              color: t.textSecond,
              textTransform: 'uppercase',
              letterSpacing: '.05em',
            }}>
              Password
            </label>
            <input
              ref={passwordRef}
              type="password"
              defaultValue=""
              style={{
                padding: '10px 14px',
                background: t.inputBg,
                border: '0.5px solid ' + t.border,
                borderRadius: '8px',
                fontSize: '14px',
                color: t.textPrimary,
                outline: 'none',
              }}
              placeholder="••••••••"
              autoComplete="new-password"
              data-form-type="other"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '11px',
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              marginTop: '4px',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;