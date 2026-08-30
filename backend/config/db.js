import pg from 'pg';
import { config } from './env.js';

const { Pool } = pg;
const pool = new Pool(config.db);

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to PostgreSQL successfully!');
  release();
});

export const query = (text, params) => pool.query(text, params);
export default pool;
