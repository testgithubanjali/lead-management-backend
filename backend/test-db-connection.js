const { Pool } = require('pg');
require('dotenv').config();

console.log('Database Config:');
console.log('  Host:', process.env.DB_HOST || 'localhost');
console.log('  Port:', parseInt(process.env.DB_PORT) || 5432);
console.log('  User:', process.env.DB_USER || 'postgres');
console.log('  DB:', process.env.DB_NAME || 'lead_management');
console.log('');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  connectionTimeoutMillis: 5000,
});

pool.connect()
  .then(client => {
    console.log('✅ Connected successfully!');
    return client.query('SELECT version()').then(result => {
      console.log('Version:', result.rows[0].version.split(',')[0]);
      client.release();
      pool.end();
    });
  })
  .catch(err => {
    console.error('❌ Connection failed!');
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    pool.end();
    process.exit(1);
  });
