import { useEffect, useState } from 'react';
import api from '../../api/api';
import { useTheme } from '../../context/ThemeContext';
import { themes } from '../../theme';

const roleStyle = {
  admin:      { background: '#3b0f6e', color: '#a78bfa' },
  manager:    { background: '#0f3b2e', color: '#34d399' },
  commercial: { background: '#3b2100', color: '#f59e0b' },
  viewer:     { background: '#1e2130', color: '#8892b0' },
  staff:      { background: '#1e3a5f', color: '#60a5fa' },
};

const roleDesc = {
  admin:      'Full access — manages everything including users',
  manager:    'Manages team clients, deals and can assign tasks',
  commercial:'Manages own clients and deals only',
  viewer:     'Read-only access to team data',
  staff:      'Full access except user management',
};

const ROLES = ['admin', 'manager', 'commercial', 'viewer'];

const avatarColors = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#0f6e56,#1d9e75)',
  'linear-gradient(135deg,#854F0B,#EF9F27)',
  'linear-gradient(135deg,#185FA5,#60a5fa)',
  'linear-gradient(135deg,#A32D2D,#f87171)',
  'linear-gradient(135deg,#3C3489,#7F77DD)',
  'linear-gradient(135deg,#0f4c6e,#0ea5e9)',
];

const initials = name => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

const Users = () => {
  const { dark } = useTheme();
  const t = themes[dark ? 'dark' : 'light'];

  const [users,   setUsers]   = useState([]);
  const [teams,   setTeams]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('kanban');
  const [editId,  setEditId]  = useState(null);
  const [form,    setForm]    = useState({ name: '', email: '', role: 'staff', team_id: '' });
  const [newTeam, setNewTeam] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'staff', team_id: '' });

  const fetchAll = async () => {
    try {
      const [uRes, tRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/users/teams/all'),
      ]);
      setUsers(uRes.data);
      setTeams(tRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/admin/users/' + editId, form);
      setEditId(null);
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Error.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await api.delete('/admin/users/' + id); fetchAll(); }
    catch (err) { alert(err.response?.data?.message || 'Error.'); }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try { await api.post('/admin/users/teams', { name: newTeam }); setNewTeam(''); fetchAll(); }
    catch (err) { alert(err.response?.data?.message || 'Error.'); }
  };

  const handleDeleteTeam = async (id) => {
    if (!window.confirm('Delete this team?')) return;
    try { await api.delete('/admin/users/teams/' + id); fetchAll(); }
    catch (err) { alert(err.response?.data?.message || 'Error.'); }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users/create', newUser);
      setShowAdd(false);
      setNewUser({ name: '', email: '', password: '', role: 'staff', team_id: '' });
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Error creating user.'); }
  };

  if (loading) return <p style={{ color: t.textMuted, padding: '20px' }}>Loading...</p>;

  const inp = {
    padding: '8px 12px', background: t.inputBg, border: '0.5px solid ' + t.border,
    borderRadius: '8px', fontSize: '13px', color: t.textPrimary, outline: 'none', width: '100%',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '500', color: t.textPrimary }}>Admin Panel</h2>
          <p style={{ fontSize: '13px', color: t.textMuted, marginTop: '2px' }}>{users.length} users — {teams.length} teams</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ padding: '9px 18px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
          + Add user
        </button>
      </div>

      {showAdd && (
        <div style={{ background: t.surface, border: '0.5px solid ' + t.border, borderRadius: '10px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: t.textPrimary }}>New user</span>
            <button onClick={() => setShowAdd(false)} style={{ background: 'transparent', border: '0.5px solid ' + t.border, borderRadius: '6px', padding: '4px 12px', fontSize: '12px', color: t.textSecond, cursor: 'pointer' }}>Cancel</button>
          </div>
          <form onSubmit={handleAddUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[['Full name *','name','text'],['Email *','email','email'],['Password *','password','password']].map(([label,field,type]) => (
              <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</label>
                <input value={newUser[field]} onChange={e => setNewUser({...newUser,[field]:e.target.value})} style={inp} type={type} required />
              </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '.05em' }}>Role</label>
              <select value={newUser.role} onChange={e => setNewUser({...newUser,role:e.target.value})} style={inp}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '.05em' }}>Team</label>
              <select value={newUser.team_id} onChange={e => setNewUser({...newUser,team_id:e.target.value})} style={inp}>
                <option value="">No team</option>
                {teams.map(tm => <option key={tm.id} value={tm.id}>{tm.name}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button type="submit" style={{ padding: '9px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Create user</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[['kanban','By role'],['teams','By team']].map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer',
            background: tab === key ? '#6366f1' : t.surface,
            color:      tab === key ? '#fff'    : t.textSecond,
            border:     tab === key ? 'none'    : '0.5px solid ' + t.border,
          }}>{label}</button>
        ))}
      </div>

      {tab === 'kanban' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          {ROLES.map(role => {
            const roleUsers = users.filter(u => u.role === role);
            return (
              <div key={role} style={{ background: t.surface, border: '0.5px solid ' + t.border, borderRadius: '10px', padding: '14px', minHeight: '200px' }}>
                <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ ...roleStyle[role], fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500', textTransform: 'capitalize' }}>{role}</span>
                  <span style={{ fontSize: '11px', color: t.textMuted, background: t.bg, border: '0.5px solid ' + t.border, borderRadius: '20px', padding: '1px 7px' }}>{roleUsers.length}</span>
                </div>
                <p style={{ fontSize: '10px', color: t.textMuted, marginBottom: '12px', lineHeight: '1.4' }}>{roleDesc[role]}</p>

                {roleUsers.map((user, i) => (
                  <div key={user.id} style={{ background: t.bg, border: '0.5px solid ' + t.border, borderLeft: '3px solid ' + (roleStyle[role]?.color || '#6366f1'), borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
                    {editId === user.id ? (
                      <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <input value={form.name}    onChange={e => setForm({...form,name:e.target.value})}    style={{ ...inp, fontSize: '12px' }} required placeholder="Name" />
                        <input value={form.email}   onChange={e => setForm({...form,email:e.target.value})}   style={{ ...inp, fontSize: '12px' }} required placeholder="Email" />
                        <select value={form.role}    onChange={e => setForm({...form,role:e.target.value})}    style={{ ...inp, fontSize: '12px' }}>{ROLES.map(r=><option key={r} value={r}>{r}</option>)}</select>
                        <select value={form.team_id} onChange={e => setForm({...form,team_id:e.target.value})} style={{ ...inp, fontSize: '12px' }}>
                          <option value="">No team</option>
                          {teams.map(tm=><option key={tm.id} value={tm.id}>{tm.name}</option>)}
                        </select>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          <button type="submit" style={{ flex: 1, padding: '5px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Save</button>
                          <button type="button" onClick={() => setEditId(null)} style={{ flex: 1, padding: '5px', background: t.surface, border: '0.5px solid ' + t.border, borderRadius: '6px', fontSize: '11px', color: t.textSecond, cursor: 'pointer' }}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '500', color: '#fff', flexShrink: 0 }}>{initials(user.name)}</div>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '500', color: t.textPrimary }}>{user.name}</div>
                            <div style={{ fontSize: '10px', color: t.textMuted }}>{user.team_name || 'No team'}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: '11px', color: t.textMuted, marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => { setForm({ name: user.name, email: user.email, role: user.role, team_id: user.team_id || '' }); setEditId(user.id); }} style={{ fontSize: '11px', color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Edit</button>
                          <button onClick={() => handleDelete(user.id)} style={{ fontSize: '11px', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {roleUsers.length === 0 && <div style={{ textAlign: 'center', padding: '16px', fontSize: '12px', color: t.textMuted, border: '0.5px dashed ' + t.border, borderRadius: '8px' }}>No users</div>}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'teams' && (
        <div>
          <form onSubmit={handleCreateTeam} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <input value={newTeam} onChange={e => setNewTeam(e.target.value)} placeholder="New team name..." style={{ ...inp, maxWidth: '300px' }} required />
            <button type="submit" style={{ padding: '9px 18px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>+ Create team</button>
          </form>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {teams.map(team => {
              const members = users.filter(u => String(u.team_id) === String(team.id));
              return (
                <div key={team.id} style={{ background: t.surface, border: '0.5px solid ' + t.border, borderRadius: '10px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: t.textPrimary }}>{team.name}</div>
                      <div style={{ fontSize: '12px', color: t.textMuted, marginTop: '2px' }}>{members.length} member{members.length !== 1 ? 's' : ''}</div>
                    </div>
                    <button onClick={() => handleDeleteTeam(team.id)} style={{ background: 'none', border: 'none', fontSize: '12px', color: '#f87171', cursor: 'pointer', fontWeight: '500' }}>Delete</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {members.map((u, i) => (
                      <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: t.bg, borderRadius: '8px', border: '0.5px solid ' + t.border }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#fff', fontWeight: '500' }}>{initials(u.name)}</div>
                          <span style={{ fontSize: '12px', color: t.textPrimary }}>{u.name}</span>
                        </div>
                        <span style={{ ...roleStyle[u.role], fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '500' }}>{u.role}</span>
                      </div>
                    ))}
                    {members.length === 0 && <div style={{ fontSize: '12px', color: t.textMuted, textAlign: 'center', padding: '8px' }}>No members yet</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
