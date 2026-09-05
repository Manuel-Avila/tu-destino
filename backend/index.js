import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import './config/db.js';
import { initDb } from './db/init.js';
import authRouter from './routes/auth.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running and connected to DB!');
});

// Todas las rutas de autenticación viven bajo /api/auth (router en
// backend/routes/auth.routes.js). Ahí también se protege /me con JWT.
app.use('/api/auth', authRouter);

// 404 para cualquier ruta de API no encontrada.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

async function start() {
  try {
    await initDb();
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (err) {
    console.error('[startup] No se pudo iniciar el servidor:', err);
    process.exit(1);
  }
}

start();
