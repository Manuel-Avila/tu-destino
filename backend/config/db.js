import pg from 'pg';
import { config } from './env.js';

const { Pool } = pg;
// Render (u otros proveedores) exigen SSL en conexiones externas.
// En conexiones internas de Render dejá DB_SSL sin definir.
const ssl = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined;
const pool = new Pool({ ...config.db, ssl });

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to PostgreSQL successfully!');
  release();
});

export const query = (text, params) => pool.query(text, params);
export default pool;
