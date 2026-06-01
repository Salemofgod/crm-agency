import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../theme';

const statusStyle = {
  active:   { bg: '#064e3b', color: '#34d399', label: 'Active'   },
  inactive: { bg: '#1e2130', color: '#8892b0', label: 'Inactive' },
  prospect: { bg: '#3b2100', color: '#f59e0b', label: 'Prospect' },
};

const avatarColors = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#0f6e56,#1d9e75)',
  'linear-gradient(135deg,#854F0B,#EF9F27)',
  'linear-gradient(135deg,#185FA5,#60a5fa)',
  'linear-gradient(135deg,#A32D2D,#f87171)',
  'linear-gradient(135deg,#3C3489,#7F77DD)',
];

const initials = name => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

const Clients = () => {
  const { user } = useAuth();
  const { dark } = useTheme();
  const t = themes[dark ? 'dark' : 'light'];

  const isViewer = user?.role === 'viewer';
  const isAdmin  = user?.role === 'admin';

  const [clients,  setClients]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');
  const [form, setForm] = useState({ name:'', email:'', phone:'', company:'', status:'active', notes:'' });

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClients(); }, []);

  const resetForm = () => {
    setForm({ name:'', email:'', phone:'', company:'', status:'active', notes:'' });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await api.put('/clients/' + editId, form); }
      else        { await api.post('/clients', form); }
      resetForm();
      fetchClients();
    } catch (err) { alert(err.response?.data?.message || 'Error.'); }
  };

  const handleEdit = (c) => {
    setForm({ name:c.name, email:c.email, phone:c.phone||'', company:c.company||'', status:c.status, notes:c.notes||'' });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this client?')) return;
    try { await api.delete('/clients/' + id); fetchClients(); }
    catch (err) { alert(err.response?.data?.message || 'Error.'); }
  };

  const filtered = clients.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    all:      clients.length,
    active:   clients.filter(c => c.status === 'active').length,
    prospect: clients.filter(c => c.status === 'prospect').length,
    inactive: clients.filter(c => c.status === 'inactive').length,
  };

  if (loading) return <p style={{ color: t.textMuted, padding: '20px' }}>Loading...</p>;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' }}>
        <div>
          <h2 style={{ fontSize:'20px', fontWeight:'500', color: t.textPrimary }}>Clients</h2>
          <p style={{ fontSize:'13px', color: t.textMuted, marginTop:'2px' }}>{clients.length} total clients</p>
        </div>
        {!isViewer && (
          <button style={{ padding:'9px 18px', background:'#6366f1', color:'#fff', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'500', cursor:'pointer' }}
            onClick={() => { resetForm(); setShowForm(true); }}>
            + Add client
          </button>
        )}
      </div>

      <div style={{ display:'flex', gap:'8px', marginBottom:'16px', flexWrap:'wrap', alignItems:'center' }}>
        {[['all','All'],['active','Active'],['prospect','Prospect'],['inactive','Inactive']].map(([key,label]) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'500', cursor:'pointer',
            background: filter === key ? '#6366f1' : t.surface,
            color:      filter === key ? '#fff'    : t.textSecond,
            border:     filter === key ? 'none'    : '0.5px solid ' + t.border,
          }}>
            {label} <span style={{ opacity:.7 }}>({counts[key]})</span>
          </button>
        ))}
        <input
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding:'7px 12px', borderRadius:'8px', fontSize:'12px', outline:'none', background: t.surface, border:'0.5px solid '+t.border, color: t.textPrimary, marginLeft:'auto', width:'200px' }}
        />
      </div>

      {isViewer && (
        <div style={{ padding:'10px 14px', background:'#1e3a5f', border:'0.5px solid #60a5fa', borderRadius:'8px', marginBottom:'16px', fontSize:'12px', color:'#60a5fa' }}>
          You have read-only access. Contact your admin to make changes.
        </div>
      )}

      {showForm && !isViewer && (
        <div style={{ background: t.surface, border:'0.5px solid '+t.border, borderRadius:'10px', padding:'20px', marginBottom:'16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
            <span style={{ fontSize:'14px', fontWeight:'500', color: t.textPrimary }}>{editId ? 'Edit client' : 'New client'}</span>
            <button onClick={resetForm} style={{ background:'transparent', border:'0.5px solid '+t.border, borderRadius:'6px', padding:'5px 12px', fontSize:'12px', color: t.textSecond, cursor:'pointer' }}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            {[
              ['Full name *', 'name',    'text',  'Thomas Dupont'   ],
              ['Email *',     'email',   'email', 'thomas@dupont.fr'],
              ['Phone',       'phone',   'text',  '+33 6 ...'       ],
              ['Company',     'company', 'text',  'Dupont & Co'     ],
            ].map(([label, field, type, ph]) => (
              <div key={field} style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                <label style={{ fontSize:'11px', color: t.textMuted, textTransform:'uppercase', letterSpacing:'.05em' }}>{label}</label>
                <input
                  value={form[field]}
                  onChange={e => setForm({...form, [field]: e.target.value})}
                  style={{ padding:'9px 12px', background: t.inputBg, border:'0.5px solid '+t.border, borderRadius:'8px', fontSize:'13px', color: t.textPrimary, outline:'none' }}
                  type={type}
                  placeholder={ph}
                  required={label.includes('*')}
                />
              </div>
            ))}
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              <label style={{ fontSize:'11px', color: t.textMuted, textTransform:'uppercase', letterSpacing:'.05em' }}>Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                style={{ padding:'9px 12px', background: t.inputBg, border:'0.5px solid '+t.border, borderRadius:'8px', fontSize:'13px', color: t.textPrimary, outline:'none' }}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="prospect">Prospect</option>
              </select>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              <label style={{ fontSize:'11px', color: t.textMuted, textTransform:'uppercase', letterSpacing:'.05em' }}>Notes</label>
              <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                style={{ padding:'9px 12px', background: t.inputBg, border:'0.5px solid '+t.border, borderRadius:'8px', fontSize:'13px', color: t.textPrimary, outline:'none' }}
                placeholder="Notes..." />
            </div>
            <div style={{ gridColumn:'1 / -1' }}>
              <button type="submit" style={{ padding:'9px 18px', background:'#6366f1', color:'#fff', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'500', cursor:'pointer' }}>
                Save client
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'14px' }}>
        {filtered.map((c, i) => {
          const st = statusStyle[c.status] || statusStyle.active;
          return (
            <div key={c.id} style={{ background: t.surface, border:'0.5px solid '+t.border, borderRadius:'12px', padding:'20px', display:'flex', flexDirection:'column', gap:'10px' }}>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ width:'44px', height:'44px', borderRadius:'12px', background: avatarColors[i % avatarColors.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'500', color:'#fff' }}>
                  {initials(c.name)}
                </div>
                <span style={{ fontSize:'11px', padding:'3px 10px', borderRadius:'20px', fontWeight:'500', background: st.bg, color: st.color }}>
                  {st.label}
                </span>
              </div>

              <div style={{ fontSize:'15px', fontWeight:'500', color: t.textPrimary }}>{c.name}</div>
              <div style={{ fontSize:'13px', fontWeight:'500', color: '#6366f1' }}>{c.company || '—'}</div>

              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'12px', color: t.textMuted }}>
                  <span style={{ opacity:.5, width:'14px' }}>@</span>{c.email}
                </div>
                {c.phone && (
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'12px', color: t.textMuted }}>
                    <span style={{ opacity:.5, width:'14px' }}>T</span>{c.phone}
                  </div>
                )}
                {c.creator && (
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'12px' }}>
                    <span style={{ opacity:.5, width:'14px', color: t.textMuted }}>U</span>
                    <span style={{ color: t.textMuted }}>Owner: </span>
                    <span style={{ color:'#818cf8', fontWeight:'500' }}>{c.creator.name}</span>
                  </div>
                )}
                {c.notes && (
                  <div style={{ fontSize:'12px', color: t.textMuted, borderTop:'0.5px solid '+t.border, paddingTop:'8px', marginTop:'4px', fontStyle:'italic', lineHeight:'1.5' }}>
                    {c.notes}
                  </div>
                )}
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'10px', borderTop:'0.5px solid '+t.border, marginTop:'4px' }}>
                <span style={{ fontSize:'11px', color: t.textMuted }}>
                  {new Date(c.created_at).toLocaleDateString('en-GB')}
                </span>
                <div style={{ display:'flex', gap:'10px' }}>
                  {!isViewer && (
                    <button onClick={() => handleEdit(c)} style={{ background:'none', border:'none', fontSize:'12px', color:'#818cf8', fontWeight:'500', cursor:'pointer' }}>
                      Edit
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => handleDelete(c.id)} style={{ background:'none', border:'none', fontSize:'12px', color:'#f87171', fontWeight:'500', cursor:'pointer' }}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'48px', color: t.textMuted, fontSize:'14px' }}>
          No clients found.
        </div>
      )}
    </div>
  );
};

export default Clients;