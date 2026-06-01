const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const runMigration = async () => {
  const client = new Client({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT,
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  try {
    await client.connect();
    console.log('Connected to PostgreSQL...');
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(sql);
    console.log('Schema created successfully.');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await client.end();
  }
};

runMigration();
