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

const accounts = [
  { email: 'salem@agency.com',   pwd: 'admin123'      },
  { email: 'sophie@agency.com',  pwd: 'manager123'    },
  { email: 'jean@agency.com',    pwd: 'manager123'    },
  { email: 'jul@agency.com',     pwd: 'manager123'    },
  { email: 'youssef@agency.com', pwd: 'commercial123' },
  { email: 'lucas@agency.com',   pwd: 'commercial123' },
  { email: 'fatou@agency.com',   pwd: 'commercial123' },
  { email: 'amina@agency.com',   pwd: 'viewer123'     },
  { email: 'marie@agency.com',   pwd: 'viewer123'     },
  { email: 'paul@agency.com',    pwd: 'viewer123'     },
];

c.connect().then(async () => {
  for (const acc of accounts) {
    const hash = await bcrypt.hash(acc.pwd, 10);
    await c.query('UPDATE users SET password = $1 WHERE email = $2', [hash, acc.email]);
    console.log('OK:', acc.email, '->', acc.pwd);
  }
  c.end();
}).catch(e => { console.error('ERREUR:', e.message); c.end(); });
