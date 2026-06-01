import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../theme';

const columns = [
  { key: 'todo',        label: 'To Do',       color: '#6366f1' },
  { key: 'in_progress', label: 'In Progress', color: '#60a5fa' },
  { key: 'done',        label: 'Done',        color: '#34d399' },
];

const priorityStyle = {
  high:   { background: '#3b0f0f', color: '#f87171' },
  medium: { background: '#3b2100', color: '#f59e0b' },
  low:    { background: '#064e3b', color: '#34d399' },
};

const Tasks = () => {
  const { user } = useAuth();
  const { dark } = useTheme();
  const t = themes[dark ? 'dark' : 'light'];

  const isViewer = user?.role === 'viewer';
  const isAdmin  = user?.role === 'admin';

  const [tasks,    setTasks]    = useState([]);
  const [clients,  setClients]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', status: 'todo', priority: 'medium', due_date: '', client_id: '' });

  const fetchAll = async () => {
    try {
      const [taskRes, clientRes] = await Promise.all([api.get('/tasks'), api.get('/clients')]);
      setTasks(taskRes.data);
      setClients(clientRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', form);
      setShowForm(false);
      setForm({ title: '', description: '', status: 'todo', priority: 'medium', due_date: '', client_id: '' });
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Error saving task.'); }
  };

  const moveTask = async (task, newStatus) => {
    if (isViewer) return;
    try {
      await api.put('/tasks/' + task.id, {
        ...task,
        status:      newStatus,
        client_id:   task.client_id,
        sale_id:     task.sale_id,
        assigned_to: task.assigned_to,
      });
      fetchAll();
    } catch (err) { console.error(err); }
  };

  const deleteTask = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm('Delete this task?')) return;
    try { await api.delete('/tasks/' + id); fetchAll(); }
    catch (err) { console.error(err); }
  };

  if (loading) return <p style={{ color: t.textMuted, padding: '20px' }}>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '500', color: t.textPrimary }}>Tasks</h2>
          <p style={{ fontSize: '13px', color: t.textMuted, marginTop: '2px' }}>{tasks.length} total tasks</p>
        </div>
        {!isViewer && (
          <button style={{ padding: '9px 18px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }} onClick={() => setShowForm(!showForm)}>
            + New task
          </button>
        )}
      </div>

      {isViewer && (
        <div style={{ padding: '10px 14px', background: '#1e3a5f', border: '0.5px solid #60a5fa', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', color: '#60a5fa' }}>
          You have read-only access. Contact your admin to make changes.
        </div>
      )}

      {showForm && !isViewer && (
        <div style={{ background: t.surface, border: '0.5px solid ' + t.border, borderRadius: '10px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: t.textPrimary }}>New task</span>
            <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '0.5px solid ' + t.border, borderRadius: '6px', padding: '5px 12px', fontSize: '12px', color: t.textSecond, cursor: 'pointer' }}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '.05em' }}>Title *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={{ padding: '9px 12px', background: t.inputBg, border: '0.5px solid ' + t.border, borderRadius: '8px', fontSize: '13px', color: t.textPrimary, outline: 'none' }} required placeholder="Task title" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '.05em' }}>Client</label>
              <select value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})} style={{ padding: '9px 12px', background: t.inputBg, border: '0.5px solid ' + t.border, borderRadius: '8px', fontSize: '13px', color: t.textPrimary, outline: 'none' }}>
                <option value="">No client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '.05em' }}>Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} style={{ padding: '9px 12px', background: t.inputBg, border: '0.5px solid ' + t.border, borderRadius: '8px', fontSize: '13px', color: t.textPrimary, outline: 'none' }}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '.05em' }}>Due date</label>
              <input value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} style={{ padding: '9px 12px', background: t.inputBg, border: '0.5px solid ' + t.border, borderRadius: '8px', fontSize: '13px', color: t.textPrimary, outline: 'none' }} type="date" />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: t.textMuted, textTransform: 'uppercase', letterSpacing: '.05em' }}>Description</label>
              <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ padding: '9px 12px', background: t.inputBg, border: '0.5px solid ' + t.border, borderRadius: '8px', fontSize: '13px', color: t.textPrimary, outline: 'none' }} placeholder="Optional description" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button type="submit" style={{ padding: '9px 18px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Create task</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {columns.map(col => {
          const colTasks = tasks.filter(t2 => t2.status === col.key);
          return (
            <div key={col.key} style={{ background: t.surface, border: '0.5px solid ' + t.border, borderRadius: '10px', padding: '16px', minHeight: '400px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: '12px', fontWeight: '500', color: t.textPrimary }}>{col.label}</span>
                </div>
                <span style={{ fontSize: '11px', color: t.textMuted, background: t.bg, border: '0.5px solid ' + t.border, borderRadius: '20px', padding: '1px 8px' }}>{colTasks.length}</span>
              </div>

              {colTasks.map(task => (
                <div key={task.id} style={{ background: t.bg, border: '0.5px solid ' + t.border, borderLeft: '3px solid ' + col.color, borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: t.textPrimary, marginBottom: '4px' }}>{task.title}</div>
                  {task.description && <div style={{ fontSize: '12px', color: t.textMuted, marginBottom: '6px' }}>{task.description}</div>}
                  {task.client && <div style={{ fontSize: '12px', color: '#6366f1', marginBottom: '8px' }}>{task.client.name}</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isViewer ? '0' : '10px' }}>
                    <span style={{ ...priorityStyle[task.priority], fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '500' }}>{task.priority}</span>
                    {task.due_date && <span style={{ fontSize: '11px', color: t.textMuted }}>{task.due_date}</span>}
                  </div>
                  {!isViewer && (
                    <div style={{ display: 'flex', gap: '8px', borderTop: '0.5px solid ' + t.border, paddingTop: '8px' }}>
                      {col.key !== 'todo'        && <button onClick={() => moveTask(task, col.key === 'in_progress' ? 'todo' : 'in_progress')} style={{ background: 'none', border: 'none', fontSize: '12px', color: t.textSecond, fontWeight: '500', cursor: 'pointer' }}>Back</button>}
                      {col.key !== 'done'        && <button onClick={() => moveTask(task, col.key === 'todo' ? 'in_progress' : 'done')} style={{ background: 'none', border: 'none', fontSize: '12px', color: '#818cf8', fontWeight: '500', cursor: 'pointer' }}>Next</button>}
                      {isAdmin && <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', fontSize: '12px', color: '#f87171', fontWeight: '500', cursor: 'pointer', marginLeft: 'auto' }}>Delete</button>}
                    </div>
                  )}
                </div>
              ))}

              {colTasks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', fontSize: '12px', color: t.textMuted, border: '0.5px dashed ' + t.border, borderRadius: '8px' }}>
                  No tasks
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tasks;