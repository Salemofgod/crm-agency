const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const c = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

const users = [
  { name: 'Salem Gnanga',  email: 'salem@agency.com',   pwd: 'admin123',      role: 'admin'      },
  { name: 'Sophie Martin', email: 'sophie@agency.com',  pwd: 'manager123',    role: 'manager'    },
  { name: 'Jean Moreau',   email: 'jean@agency.com',    pwd: 'manager123',    role: 'manager'    },
  { name: 'Jul Ariel',     email: 'jul@agency.com',     pwd: 'manager123',    role: 'manager'    },
  { name: 'Youssef Diallo',email: 'youssef@agency.com', pwd: 'commercial123', role: 'commercial' },
  { name: 'Lucas Bernard', email: 'lucas@agency.com',   pwd: 'commercial123', role: 'commercial' },
  { name: 'Fatou Diallo',  email: 'fatou@agency.com',   pwd: 'commercial123', role: 'commercial' },
  { name: 'Amina Toure',   email: 'amina@agency.com',   pwd: 'viewer123',     role: 'viewer'     },
  { name: 'Marie Leclerc', email: 'marie@agency.com',   pwd: 'viewer123',     role: 'viewer'     },
  { name: 'Paul Renard',   email: 'paul@agency.com',    pwd: 'viewer123',     role: 'viewer'     },
];

c.connect().then(async () => {
  for (const u of users) {
    const hash = await bcrypt.hash(u.pwd, 10);
    await c.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE
      SET name=$1, password=$3, role=$4
    `, [u.name, u.email, hash, u.role]);
    console.log('OK:', u.name, '|', u.role, '|', u.pwd);
  }
  console.log('\nAll users restored.');
  c.end();
}).catch(e => { console.error('ERROR:', e.message); c.end(); });
