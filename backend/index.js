import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import './config/db.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running and connected to DB!');
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
