const { Client } = require('pg');
require('dotenv').config();

const c = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

const today = new Date();
const addDays = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

c.connect().then(async () => {
  await c.query('DELETE FROM tasks');
  console.log('Old tasks deleted');

  const tasks = [
    // TO DO
    { title: 'Call client Thomas Dupont', description: 'Discuss SEO contract renewal', status: 'todo', priority: 'high', due_date: addDays(-1) },
    { title: 'Prepare website redesign quote', description: 'Full redesign quote for Aisha Kone', status: 'todo', priority: 'medium', due_date: addDays(1) },
    { title: 'Social media audit Mansour Group', description: 'Full audit of Instagram and LinkedIn accounts', status: 'todo', priority: 'medium', due_date: addDays(2) },
    { title: 'Write API documentation', description: 'Document all REST endpoints clearly', status: 'todo', priority: 'low', due_date: addDays(4) },

    // IN PROGRESS
    { title: 'Send revised proposal', description: 'Update quote based on client feedback', status: 'in_progress', priority: 'high', due_date: addDays(-2) },
    { title: 'Set up staging server', description: 'Configure pre-production hosting env', status: 'in_progress', priority: 'medium', due_date: addDays(1) },

    // DONE
    { title: 'Deliver brand assets', description: 'Send final files to Jean-Paul Brun', status: 'done', priority: 'high', due_date: addDays(-5) },
    { title: 'Landing page copywriting', description: 'Write all text content for landing page', status: 'done', priority: 'low', due_date: addDays(-3) },
    { title: 'Design homepage mockup', description: 'Create Figma mockup for client approval', status: 'done', priority: 'high', due_date: addDays(-4) },
  ];

  for (const t of tasks) {
    await c.query(
      'INSERT INTO tasks (title, description, status, priority, due_date, created_by) VALUES ($1, $2, $3, $4, $5, 1)',
      [t.title, t.description, t.status, t.priority, t.due_date]
    );
    console.log('Created:', t.title, '| due:', t.due_date, '| status:', t.status, '| priority:', t.priority);
  }

  console.log('\nDone! Tasks with recent dates inserted.');
  c.end();
}).catch(e => { console.error('ERROR:', e.message); c.end(); });
