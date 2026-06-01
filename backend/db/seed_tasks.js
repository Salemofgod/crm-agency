const { Client } = require('pg');
require('dotenv').config();

const seed = async () => {
  const client = new Client({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT,
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();

    const users   = await client.query('SELECT id, name FROM users ORDER BY id');
    const clients = await client.query('SELECT id, name FROM clients ORDER BY id');
    const sales   = await client.query('SELECT id, title FROM sales ORDER BY id');

    console.log('Users found:',   users.rows.map(u => u.id + ':' + u.name));
    console.log('Clients found:', clients.rows.map(c => c.id + ':' + c.name));
    console.log('Sales found:',   sales.rows.map(s => s.id + ':' + s.title));

    if (users.rows.length === 0 || clients.rows.length === 0 || sales.rows.length === 0) {
      console.error('Missing data. Run full seed first.');
      return;
    }

    const adminId   = users.rows[0].id;
    const sophieId  = users.rows[1]?.id || adminId;
    const youssefId = users.rows[3]?.id || adminId;
    const aminaId   = users.rows[4]?.id || adminId;

    const c1 = clients.rows[0]?.id;
    const c2 = clients.rows[1]?.id;
    const c3 = clients.rows[2]?.id;
    const c5 = clients.rows[4]?.id;
    const c6 = clients.rows[5]?.id;
    const c7 = clients.rows[6]?.id;

    const s1 = sales.rows[0]?.id;
    const s2 = sales.rows[1]?.id;
    const s3 = sales.rows[2]?.id;
    const s5 = sales.rows[4]?.id;
    const s6 = sales.rows[5]?.id;
    const s7 = sales.rows[6]?.id;

    await client.query('DELETE FROM tasks');
    console.log('Existing tasks cleared.');

    const tasks = [
      { title: 'Send revised proposal',    desc: 'Update quote based on client feedback',    status: 'todo',        priority: 'high',   due: '2026-04-28', client_id: c1,   sale_id: s1,   assigned: sophieId,  created: adminId },
      { title: 'Design homepage mockup',   desc: 'Create Figma mockup for client approval',  status: 'in_progress', priority: 'high',   due: '2026-04-30', client_id: c1,   sale_id: s1,   assigned: sophieId,  created: adminId },
      { title: 'Set up staging server',    desc: 'Configure pre-production hosting env',     status: 'in_progress', priority: 'medium', due: '2026-05-02', client_id: c2,   sale_id: s2,   assigned: youssefId, created: adminId },
      { title: 'Write API documentation',  desc: 'Document all REST endpoints clearly',      status: 'todo',        priority: 'low',    due: '2026-05-10', client_id: c2,   sale_id: s2,   assigned: youssefId, created: adminId },
      { title: 'Follow up with client',    desc: 'Call Marc about SEO contract renewal',     status: 'todo',        priority: 'medium', due: '2026-04-29', client_id: c3,   sale_id: s3,   assigned: sophieId,  created: adminId },
      { title: 'Deliver brand assets',     desc: 'Send final files to Jean-Paul Brun',       status: 'done',        priority: 'high',   due: '2026-03-01', client_id: c5,   sale_id: null, assigned: youssefId, created: adminId },
      { title: 'Social media audit',       desc: 'Full audit of Mansour Group accounts',     status: 'todo',        priority: 'medium', due: '2026-05-05', client_id: c6,   sale_id: s6,   assigned: aminaId,   created: adminId },
      { title: 'Landing page copywriting', desc: 'Write all text content for landing page',  status: 'done',        priority: 'low',    due: '2026-03-10', client_id: c7,   sale_id: s7,   assigned: aminaId,   created: adminId },
    ];

    for (const task of tasks) {
      await client.query(`
        INSERT INTO tasks (title, description, status, priority, due_date, client_id, sale_id, assigned_to, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [task.title, task.desc, task.status, task.priority, task.due, task.client_id, task.sale_id, task.assigned, task.created]);
      console.log('Task inserted:', task.title);
    }

    const count = await client.query('SELECT COUNT(*) FROM tasks');
    console.log('\nTotal tasks in DB:', count.rows[0].count);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
};

seed();
