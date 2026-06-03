const { Client } = require('pg');
require('dotenv').config();

const c = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

c.connect().then(async () => {

  // Récupérer les IDs des utilisateurs
  const users = await c.query('SELECT id, email, role, team_id FROM users ORDER BY id');
  console.log('Users:');
  users.rows.forEach(u => console.log(' ', u.id, u.email, u.role, 'team:', u.team_id));

  // Récupérer les clients
  const clients = await c.query('SELECT id, name FROM clients ORDER BY id');
  console.log('\nClients:', clients.rows.length);

  // Trouver les commerciaux
  const commercials = users.rows.filter(u => u.role === 'commercial');
  console.log('\nCommercials:', commercials.map(u => u.email));

  // Assigner owner_id aux clients en alternant entre les commerciaux
  for (let i = 0; i < clients.rows.length; i++) {
    const owner = commercials[i % commercials.length];
    await c.query('UPDATE clients SET owner_id = $1, created_by = $1 WHERE id = $2', [owner.id, clients.rows[i].id]);
    console.log('Client', clients.rows[i].name, '-> owner:', owner.email);
  }

  // Faire pareil pour les sales
  const sales = await c.query('SELECT id, title FROM sales ORDER BY id');
  for (let i = 0; i < sales.rows.length; i++) {
    const owner = commercials[i % commercials.length];
    await c.query('UPDATE sales SET owner_id = $1, created_by = $1 WHERE id = $2', [owner.id, sales.rows[i].id]);
    console.log('Sale', sales.rows[i].title, '-> owner:', owner.email);
  }

  console.log('\nDone!');
  c.end();
}).catch(e => { console.error('ERROR:', e.message); c.end(); });
