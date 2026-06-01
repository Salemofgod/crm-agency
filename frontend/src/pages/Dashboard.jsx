import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../theme';

const Dashboard = () => {
  const { user } = useAuth();
  const { dark } = useTheme();
  const t = themes[dark ? 'dark' : 'light'];

  const [stats,   setStats]   = useState([]);
  const [clients, setClients] = useState(0);
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [saleStats, taskRes] = await Promise.all([
        api.get('/sales/stats'),
        api.get('/tasks'),
      ]);
      setStats(saleStats.data.stats);
      setClients(saleStats.data.totalClients);
      setTasks(taskRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleTask = async (task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      await api.put('/tasks/' + task.id, {
        ...task,
        status:      newStatus,
        client_id:   task.client_id,
        sale_id:     task.sale_id,
        assigned_to: task.assigned_to,
      });
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error(err);
    }
  };

  const revenue  = stats.filter(s => s.status === 'won').reduce((sum, s) => sum + parseFloat(s.total || 0), 0);
  const won      = stats.find(s => s.status === 'won')?.count || 0;
  const openTask = tasks.filter(t => t.status !== 'done').length;
  const highTask = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;

  const chartData = [
    { month: 'Jan', revenue: 32000 },
    { month: 'Feb', revenue: 41000 },
    { month: 'Mar', revenue: 38000 },
    { month: 'Apr', revenue: 52000 },
    { month: 'May', revenue: 61000 },
    { month: 'Jun', revenue: revenue || 84000 },
  ];

  const statusColor = { won: '#34d399', lost: '#f87171', pending: '#f59e0b', in_progress: '#60a5fa' };

  if (loading) return <p style={{ color: t.textMuted, padding: '20px' }}>Loading...</p>;

  return (
    <div>
      <div style={s.pageHeader}>
        <div>
          <h2 style={{ ...s.pageTitle, color: t.textPrimary }}>Dashboard</h2>
          <p style={{ ...s.pageSub, color: t.textMuted }}>Welcome back, {user?.name}</p>
        </div>
      </div>

      <div style={s.metrics}>
        {[
          { label: 'Total Clients',  value: clients,                        sub: '+12 this month',       subColor: '#34d399', accent: '#6366f1' },
          { label: 'Revenue (won)',  value: '$' + revenue.toLocaleString(), sub: '+8% vs last month',    subColor: '#34d399', accent: '#34d399' },
          { label: 'Deals Won',      value: won,                            sub: 'this period',           subColor: t.textMuted, accent: '#f59e0b' },
          { label: 'Open Tasks',     value: openTask,                       sub: highTask + ' high priority', subColor: '#f87171', accent: '#f87171' },
        ].map((m, i) => (
          <div key={i} style={{ ...s.metricCard, background: t.surface, border: '0.5px solid ' + t.border }}>
            <div style={{ ...s.metricAccent, background: m.accent }} />
            <div style={{ ...s.metricLabel, color: t.textMuted }}>{m.label}</div>
            <div style={{ ...s.metricVal, color: t.textPrimary }}>{m.value}</div>
            <div style={{ ...s.metricSub, color: m.subColor }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={s.row}>
        <div style={{ ...s.card, background: t.surface, border: '0.5px solid ' + t.border }}>
          <div style={{ ...s.cardTitle, color: t.textMuted }}>Revenue — last 6 months</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: t.textMuted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: t.textMuted }} axisLine={false} tickLine={false} tickFormatter={v => '$' + (v/1000) + 'K'} />
              <Tooltip
                contentStyle={{ background: t.surface, border: '0.5px solid ' + t.border, borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: t.textSecond }}
                itemStyle={{ color: '#818cf8' }}
                formatter={v => ['$' + v.toLocaleString(), 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4,4,0,0]} opacity={0.9} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...s.card, background: t.surface, border: '0.5px solid ' + t.border }}>
          <div style={{ ...s.cardTitle, color: t.textMuted }}>Recent deals</div>
          <div style={s.dealList}>
            {stats.length === 0 && <p style={{ color: t.textMuted, fontSize: '13px' }}>No deals yet.</p>}
            {stats.map((st, i) => (
              <div key={i} style={{ ...s.dealRow, background: t.bg }}>
                <div style={{ ...s.dealDot, background: statusColor[st.status] || t.textMuted }} />
                <div style={{ ...s.dealName, color: t.textPrimary, textTransform: 'capitalize' }}>{st.status.replace('_', ' ')}</div>
                <div style={{ ...s.dealAmount, color: t.textPrimary }}>${parseFloat(st.total || 0).toLocaleString()}</div>
                <div style={{ ...s.badge, background: st.status === 'won' ? '#064e3b' : st.status === 'lost' ? '#3b0f0f' : '#1e3a5f', color: statusColor[st.status] || t.textMuted }}>
                  {st.count} deals
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...s.card, background: t.surface, border: '0.5px solid ' + t.border }}>
        <div style={{ ...s.cardTitle, color: t.textMuted }}>Upcoming tasks</div>
        <div style={s.taskList}>
          {tasks.slice(0, 6).map(task => {
            const done = task.status === 'done';
            return (
              <div key={task.id} style={{ ...s.taskRow, background: t.bg }}>
                <div
                  onClick={() => toggleTask(task)}
                  style={{
                    width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                    border: done ? 'none' : '1.5px solid ' + t.textMuted,
                    background: done ? '#6366f1' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .15s',
                  }}
                >
                  {done && <span style={{ color: '#fff', fontSize: '10px', fontWeight: '700' }}>✓</span>}
                </div>
                <div style={{ flex: 1, fontSize: '13px', color: done ? t.textMuted : t.textPrimary, textDecoration: done ? 'line-through' : 'none' }}>
                  {task.title}
                </div>
                {task.client && <div style={{ fontSize: '11px', color: t.textMuted, marginRight: '10px' }}>{task.client.name}</div>}
                <div style={{
                  fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '500',
                  background: task.priority === 'high' ? '#3b0f0f' : task.priority === 'medium' ? '#3b2100' : '#064e3b',
                  color: task.priority === 'high' ? '#f87171' : task.priority === 'medium' ? '#f59e0b' : '#34d399',
                }}>
                  {done ? 'done' : task.priority}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const s = {
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  pageTitle:  { fontSize: '20px', fontWeight: '500' },
  pageSub:    { fontSize: '13px', marginTop: '2px' },
  metrics:    { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' },
  metricCard: { borderRadius: '10px', padding: '16px', position: 'relative', overflow: 'hidden' },
  metricAccent: { position: 'absolute', top: 0, left: 0, width: '3px', height: '100%' },
  metricLabel:  { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '8px' },
  metricVal:    { fontSize: '24px', fontWeight: '500', marginBottom: '4px' },
  metricSub:    { fontSize: '11px' },
  row:        { display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px', marginBottom: '12px' },
  card:       { borderRadius: '10px', padding: '20px', marginBottom: '12px' },
  cardTitle:  { fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '16px' },
  dealList:   { display: 'flex', flexDirection: 'column', gap: '8px' },
  dealRow:    { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px' },
  dealDot:    { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  dealName:   { flex: 1, fontSize: '13px' },
  dealAmount: { fontSize: '13px', fontWeight: '500' },
  badge:      { fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '500' },
  taskList:   { display: 'flex', flexDirection: 'column', gap: '8px' },
  taskRow:    { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px' },
};

export default Dashboard;
