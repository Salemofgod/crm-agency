import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { themes } from '../theme';

const columns = [
  { key:'pending',     label:'Pending',     color:'#f59e0b' },
  { key:'in_progress', label:'In Progress', color:'#60a5fa' },
  { key:'won',         label:'Won',         color:'#34d399' },
  { key:'lost',        label:'Lost',        color:'#f87171' },
];

const statusStyle = {
  won:         { bg:'#064e3b', color:'#34d399' },
  lost:        { bg:'#3b0f0f', color:'#f87171' },
  pending:     { bg:'#3b2100', color:'#f59e0b' },
  in_progress: { bg:'#1e3a5f', color:'#60a5fa' },
};

const Sales = () => {
  const { user } = useAuth();
  const { dark } = useTheme();
  const t = themes[dark ? 'dark' : 'light'];

  const isViewer = user?.role === 'viewer';
  const isAdmin  = user?.role === 'admin';

  const [sales,        setSales]        = useState([]);
  const [clients,      setClients]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [editId,       setEditId]       = useState(null);
  const [selected,     setSelected]     = useState(null);
  const [comments,     setComments]     = useState([]);
  const [newComment,   setNewComment]   = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [form, setForm] = useState({ title:'', client_id:'', amount:'', status:'pending', description:'', deal_date:'' });

  const fetchAll = async () => {
    try {
      const [saleRes, clientRes] = await Promise.all([
        api.get('/sales'),
        api.get('/clients'),
      ]);
      setSales(saleRes.data);
      setClients(clientRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const fetchComments = async (saleId) => {
    try {
      const res = await api.get('/sales/' + saleId + '/comments');
      setComments(res.data);
    } catch { setComments([]); }
  };

  const openDeal = (sale) => { setSelected(sale); fetchComments(sale.id); };

  const resetForm = () => {
    setForm({ title:'', client_id:'', amount:'', status:'pending', description:'', deal_date:'' });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await api.put('/sales/' + editId, form); }
      else        { await api.post('/sales', form); }
      resetForm(); fetchAll();
    } catch (err) { alert(err.response?.data?.message || 'Error.'); }
  };

  const moveDeal = async (sale, newStatus) => {
    if (isViewer) return;
    try {
      await api.put('/sales/' + sale.id, { ...sale, client_id: sale.client_id, status: newStatus });
      fetchAll();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this deal?')) return;
    try { await api.delete('/sales/' + id); fetchAll(); setSelected(null); }
    catch (err) { alert(err.response?.data?.message || 'Error.'); }
  };

  const sendComment = async () => {
    if (!newComment.trim() || !selected) return;
    try {
      await api.post('/sales/' + selected.id + '/comments', { content: newComment });
      setNewComment('');
      fetchComments(selected.id);
    } catch (err) { console.error(err); }
  };

  const exportCSV = () => {
    const headers = ['Title','Client','Amount','Status','Date'];
    const rows = sales.map(s => [s.title, s.client?.name||'', s.amount, s.status, s.deal_date||'']);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'sales_export.csv'; a.click();
  };

  const now = new Date();
  const filteredSales = sales.filter(s => {
    if (filterPeriod === 'all') return true;
    if (!s.deal_date) return false;
    const d = new Date(s.deal_date);
    if (filterPeriod === 'week')    { const w = new Date(now); w.setDate(w.getDate()-7); return d >= w; }
    if (filterPeriod === 'month')   return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (filterPeriod === 'quarter') { const q = new Date(now); q.setMonth(q.getMonth()-3); return d >= q; }
    return true;
  });

  const totalRevenue = sales.filter(s=>s.status==='won').reduce((sum,s)=>sum+parseFloat(s.amount||0),0);
  const pipeline     = sales.filter(s=>s.status==='in_progress').reduce((sum,s)=>sum+parseFloat(s.amount||0),0);
  const winRate      = sales.length > 0 ? Math.round(sales.filter(s=>s.status==='won').length/sales.length*100) : 0;

  if (loading) return <p style={{ color: t.textMuted, padding:'20px' }}>Loading...</p>;

  return (
    <div style={{ display:'flex', gap:'20px' }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
          <div>
            <h2 style={{ fontSize:'20px', fontWeight:'500', color: t.textPrimary }}>Sales</h2>
            <p style={{ fontSize:'13px', color: t.textMuted, marginTop:'2px' }}>{sales.length} total deals</p>
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button onClick={exportCSV} style={{ padding:'9px 14px', background: t.surface, border:'0.5px solid '+t.border, borderRadius:'8px', fontSize:'13px', color: t.textSecond, cursor:'pointer' }}>
              Export CSV
            </button>
            {!isViewer && (
              <button onClick={() => { resetForm(); setShowForm(!showForm); }} style={{ padding:'9px 18px', background:'#6366f1', color:'#fff', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'500', cursor:'pointer' }}>
                + New deal
              </button>
            )}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px', marginBottom:'16px' }}>
          {[
            { label:'Revenue',  value:'$'+totalRevenue.toLocaleString(), accent:'#34d399' },
            { label:'Pipeline', value:'$'+pipeline.toLocaleString(),     accent:'#60a5fa' },
            { label:'Win rate', value:winRate+'%',                       accent:'#6366f1' },
          ].map((m,i) => (
            <div key={i} style={{ background: t.surface, border:'0.5px solid '+t.border, borderRadius:'10px', padding:'14px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, width:'3px', height:'100%', background: m.accent }} />
              <div style={{ fontSize:'11px', color: t.textMuted, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'4px' }}>{m.label}</div>
              <div style={{ fontSize:'18px', fontWeight:'500', color: t.textPrimary }}>{m.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:'8px', marginBottom:'14px', alignItems:'center' }}>
          <span style={{ fontSize:'12px', color: t.textMuted }}>Period:</span>
          {[['all','All time'],['week','This week'],['month','This month'],['quarter','This quarter']].map(([key,label]) => (
            <button key={key} onClick={() => setFilterPeriod(key)} style={{
              padding:'5px 12px', borderRadius:'20px', fontSize:'12px', cursor:'pointer',
              background: filterPeriod===key ? '#6366f1' : t.surface,
              color:      filterPeriod===key ? '#fff'    : t.textSecond,
              border:     filterPeriod===key ? 'none'    : '0.5px solid '+t.border,
            }}>{label}</button>
          ))}
        </div>

        {isViewer && (
          <div style={{ padding:'10px 14px', background:'#1e3a5f', border:'0.5px solid #60a5fa', borderRadius:'8px', marginBottom:'14px', fontSize:'12px', color:'#60a5fa' }}>
            You have read-only access. Contact your admin to make changes.
          </div>
        )}

        {showForm && !isViewer && (
          <div style={{ background: t.surface, border:'0.5px solid '+t.border, borderRadius:'10px', padding:'20px', marginBottom:'16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <span style={{ fontSize:'14px', fontWeight:'500', color: t.textPrimary }}>{editId ? 'Edit deal' : 'New deal'}</span>
              <button onClick={resetForm} style={{ background:'transparent', border:'0.5px solid '+t.border, borderRadius:'6px', padding:'5px 12px', fontSize:'12px', color: t.textSecond, cursor:'pointer' }}>Cancel</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                <label style={{ fontSize:'11px', color: t.textMuted, textTransform:'uppercase', letterSpacing:'.05em' }}>Title *</label>
                <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={{ padding:'9px 12px', background: t.inputBg, border:'0.5px solid '+t.border, borderRadius:'8px', fontSize:'13px', color: t.textPrimary, outline:'none' }} required placeholder="Website Redesign" />
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                <label style={{ fontSize:'11px', color: t.textMuted, textTransform:'uppercase', letterSpacing:'.05em' }}>Client *</label>
                <select value={form.client_id} onChange={e=>setForm({...form,client_id:e.target.value})} style={{ padding:'9px 12px', background: t.inputBg, border:'0.5px solid '+t.border, borderRadius:'8px', fontSize:'13px', color: t.textPrimary, outline:'none' }} required>
                  <option value="">Select client</option>
                  {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                <label style={{ fontSize:'11px', color: t.textMuted, textTransform:'uppercase', letterSpacing:'.05em' }}>Amount ($)</label>
                <input value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} style={{ padding:'9px 12px', background: t.inputBg, border:'0.5px solid '+t.border, borderRadius:'8px', fontSize:'13px', color: t.textPrimary, outline:'none' }} type="number" placeholder="5000" />
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                <label style={{ fontSize:'11px', color: t.textMuted, textTransform:'uppercase', letterSpacing:'.05em' }}>Status</label>
                <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={{ padding:'9px 12px', background: t.inputBg, border:'0.5px solid '+t.border, borderRadius:'8px', fontSize:'13px', color: t.textPrimary, outline:'none' }}>
                  {columns.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                <label style={{ fontSize:'11px', color: t.textMuted, textTransform:'uppercase', letterSpacing:'.05em' }}>Date</label>
                <input value={form.deal_date} onChange={e=>setForm({...form,deal_date:e.target.value})} style={{ padding:'9px 12px', background: t.inputBg, border:'0.5px solid '+t.border, borderRadius:'8px', fontSize:'13px', color: t.textPrimary, outline:'none' }} type="date" />
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                <label style={{ fontSize:'11px', color: t.textMuted, textTransform:'uppercase', letterSpacing:'.05em' }}>Description</label>
                <input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={{ padding:'9px 12px', background: t.inputBg, border:'0.5px solid '+t.border, borderRadius:'8px', fontSize:'13px', color: t.textPrimary, outline:'none' }} placeholder="Brief description..." />
              </div>
              <div style={{ gridColumn:'1 / -1' }}>
                <button type="submit" style={{ padding:'9px 18px', background:'#6366f1', color:'#fff', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'500', cursor:'pointer' }}>Save deal</button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
          {columns.map(col => {
            const colDeals = filteredSales.filter(d => d.status === col.key);
            const colTotal = colDeals.reduce((sum,d) => sum+parseFloat(d.amount||0), 0);
            return (
              <div key={col.key} style={{ background: t.surface, border:'0.5px solid '+t.border, borderRadius:'10px', padding:'14px', minHeight:'300px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <div style={{ width:'8px', height:'8px', borderRadius:'50%', background: col.color }} />
                    <span style={{ fontSize:'12px', fontWeight:'500', color: t.textPrimary }}>{col.label}</span>
                  </div>
                  <span style={{ fontSize:'11px', color: t.textMuted, background: t.bg, borderRadius:'20px', padding:'1px 7px' }}>{colDeals.length}</span>
                </div>
                <div style={{ fontSize:'11px', color: t.textMuted, marginBottom:'12px' }}>${colTotal.toLocaleString()}</div>

                {colDeals.map(deal => (
                  <div key={deal.id} onClick={() => openDeal(deal)} style={{ background: t.bg, border:'0.5px solid '+t.border, borderLeft:'3px solid '+col.color, borderRadius:'8px', padding:'12px', marginBottom:'8px', cursor:'pointer' }}>
                    <div style={{ fontSize:'13px', fontWeight:'500', color: t.textPrimary, marginBottom:'4px' }}>{deal.title}</div>
                    <div style={{ fontSize:'12px', color:'#6366f1', marginBottom:'8px' }}>{deal.client?.name}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:'13px', fontWeight:'500', color: t.textPrimary }}>${parseFloat(deal.amount).toLocaleString()}</span>
                      {deal.deal_date && <span style={{ fontSize:'10px', color: t.textMuted }}>{new Date(deal.deal_date).toLocaleDateString('en-GB')}</span>}
                    </div>
                    {deal.description && (
                      <div style={{ fontSize:'11px', color: t.textMuted, marginTop:'6px', lineHeight:'1.4' }}>
                        {deal.description.slice(0,60)}{deal.description.length>60?'...':''}
                      </div>
                    )}
                    {!isViewer && (
                      <div style={{ display:'flex', gap:'6px', marginTop:'10px', flexWrap:'wrap' }}>
                        {col.key !== 'pending'     && <button onClick={e=>{e.stopPropagation();moveDeal(deal,'pending');}}     style={{ padding:'3px 8px', background:'transparent', border:'0.5px solid '+t.border, borderRadius:'4px', fontSize:'10px', color: t.textMuted, cursor:'pointer' }}>Pending</button>}
                        {col.key !== 'in_progress' && <button onClick={e=>{e.stopPropagation();moveDeal(deal,'in_progress');}} style={{ padding:'3px 8px', background:'transparent', border:'0.5px solid #60a5fa', borderRadius:'4px', fontSize:'10px', color:'#60a5fa', cursor:'pointer' }}>Active</button>}
                        {col.key !== 'won'         && <button onClick={e=>{e.stopPropagation();moveDeal(deal,'won');}}         style={{ padding:'3px 8px', background:'transparent', border:'0.5px solid #34d399', borderRadius:'4px', fontSize:'10px', color:'#34d399', cursor:'pointer' }}>Won</button>}
                        {col.key !== 'lost'        && <button onClick={e=>{e.stopPropagation();moveDeal(deal,'lost');}}        style={{ padding:'3px 8px', background:'transparent', border:'0.5px solid #f87171', borderRadius:'4px', fontSize:'10px', color:'#f87171', cursor:'pointer' }}>Lost</button>}
                      </div>
                    )}
                  </div>
                ))}

                {colDeals.length === 0 && (
                  <div style={{ textAlign:'center', padding:'20px', fontSize:'12px', color: t.textMuted, border:'0.5px dashed '+t.border, borderRadius:'8px' }}>Empty</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <div style={{ width:'300px', flexShrink:0, background: t.surface, border:'0.5px solid '+t.border, borderRadius:'12px', padding:'20px', height:'fit-content', position:'sticky', top:'20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
            <h3 style={{ fontSize:'14px', fontWeight:'500', color: t.textPrimary, flex:1, marginRight:'10px' }}>{selected.title}</h3>
            <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', fontSize:'18px', color: t.textMuted, cursor:'pointer', lineHeight:1 }}>×</button>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'16px' }}>
            {[
              { label:'Client',  value: selected.client?.name },
              { label:'Amount',  value: '$' + parseFloat(selected.amount).toLocaleString(), color:'#34d399' },
              { label:'Date',    value: selected.deal_date || '—' },
            ].map((row,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:'8px', borderBottom:'0.5px solid '+t.border }}>
                <span style={{ fontSize:'12px', color: t.textMuted }}>{row.label}</span>
                <span style={{ fontSize:'13px', color: row.color || t.textPrimary, fontWeight: row.color ? '500' : '400' }}>{row.value}</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:'8px', borderBottom:'0.5px solid '+t.border }}>
              <span style={{ fontSize:'12px', color: t.textMuted }}>Status</span>
              <span style={{ ...statusStyle[selected.status], fontSize:'11px', padding:'3px 10px', borderRadius:'20px', fontWeight:'500', textTransform:'capitalize' }}>{selected.status.replace('_',' ')}</span>
            </div>
            {selected.description && (
              <div style={{ fontSize:'12px', color: t.textSecond, lineHeight:'1.5', padding:'8px', background: t.bg, borderRadius:'6px' }}>{selected.description}</div>
            )}
          </div>

          {!isViewer && (
            <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
              <button onClick={() => { setForm({ title:selected.title, client_id:selected.client_id, amount:selected.amount, status:selected.status, description:selected.description||'', deal_date:selected.deal_date||'' }); setEditId(selected.id); setShowForm(true); setSelected(null); }} style={{ flex:1, padding:'8px', background: t.bg, border:'0.5px solid '+t.border, borderRadius:'8px', fontSize:'12px', color: t.textSecond, cursor:'pointer' }}>Edit</button>
              {isAdmin && (
                <button onClick={() => handleDelete(selected.id)} style={{ flex:1, padding:'8px', background:'#3b0f0f', border:'none', borderRadius:'8px', fontSize:'12px', color:'#f87171', cursor:'pointer' }}>Delete</button>
              )}
            </div>
          )}

          <div style={{ borderTop:'0.5px solid '+t.border, paddingTop:'16px' }}>
            <div style={{ fontSize:'11px', fontWeight:'500', color: t.textMuted, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'12px' }}>Comments</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'12px', maxHeight:'200px', overflowY:'auto' }}>
              {comments.length === 0 && <p style={{ fontSize:'12px', color: t.textMuted }}>No comments yet.</p>}
              {comments.map((c,i) => (
                <div key={i} style={{ background: t.bg, borderRadius:'8px', padding:'10px', border:'0.5px solid '+t.border }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                    <span style={{ fontSize:'11px', fontWeight:'500', color:'#818cf8' }}>{c.author?.name || 'Unknown'}</span>
                    <span style={{ fontSize:'10px', color: t.textMuted }}>{new Date(c.created_at).toLocaleDateString('en-GB')}</span>
                  </div>
                  <p style={{ fontSize:'12px', color: t.textSecond, lineHeight:'1.5' }}>{c.content}</p>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <input
                value={newComment}
                onChange={e=>setNewComment(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&sendComment()}
                placeholder="Add a comment..."
                style={{ flex:1, padding:'8px 12px', background: t.inputBg, border:'0.5px solid '+t.border, borderRadius:'8px', fontSize:'12px', color: t.textPrimary, outline:'none' }}
              />
              <button onClick={sendComment} style={{ padding:'8px 14px', background:'#6366f1', color:'#fff', border:'none', borderRadius:'8px', fontSize:'12px', cursor:'pointer' }}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;