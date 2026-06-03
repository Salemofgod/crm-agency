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

  // Créer les équipes
  await c.query('DELETE FROM teams');
  const t1 = await c.query("INSERT INTO teams (name) VALUES ('Development') RETURNING id");
  const t2 = await c.query("INSERT INTO teams (name) VALUES ('Design') RETURNING id");
  const t3 = await c.query("INSERT INTO teams (name) VALUES ('Sales') RETURNING id");

  const devId   = t1.rows[0].id;
  const desId   = t2.rows[0].id;
  const salesId = t3.rows[0].id;

  console.log('Teams created:', devId, desId, salesId);

  // Assigner les équipes aux utilisateurs
  await c.query("UPDATE users SET team_id = $1 WHERE email = 'sophie@agency.com'",  [devId]);
  await c.query("UPDATE users SET team_id = $1 WHERE email = 'jean@agency.com'",    [desId]);
  await c.query("UPDATE users SET team_id = $1 WHERE email = 'jul@agency.com'",     [salesId]);
  await c.query("UPDATE users SET team_id = $1 WHERE email = 'youssef@agency.com'", [devId]);
  await c.query("UPDATE users SET team_id = $1 WHERE email = 'lucas@agency.com'",   [devId]);
  await c.query("UPDATE users SET team_id = $1 WHERE email = 'fatou@agency.com'",   [salesId]);
  await c.query("UPDATE users SET team_id = $1 WHERE email = 'amina@agency.com'",   [desId]);
  await c.query("UPDATE users SET team_id = $1 WHERE email = 'marie@agency.com'",   [desId]);
  await c.query("UPDATE users SET team_id = $1 WHERE email = 'paul@agency.com'",    [salesId]);

  // Vérification
  const res = await c.query('SELECT name, role, team_id FROM users ORDER BY id');
  res.rows.forEach(u => console.log(u.name, '|', u.role, '| team_id:', u.team_id));

  console.log('\nDone!');
  c.end();
}).catch(e => { console.error('ERROR:', e.message); c.end(); });
