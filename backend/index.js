import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import './config/db.js';
import { initDb } from './db/init.js';
import authRouter from './routes/auth.routes.js';
import eventosRouter from './routes/eventos.routes.js';
import resenasRouter from './routes/resenas.routes.js';
import destinosRouter from './routes/destinos.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running and connected to DB!');
});

// Todas las rutas de autenticación viven bajo /api/auth (router en
// backend/routes/auth.routes.js). Ahí también se protege /me con JWT.
app.use('/api/auth', authRouter);

// Eventos ecológicos: listado, detalle y webhook de confirmaciones del Google Form.
app.use('/api/eventos', eventosRouter);

// Reseñas de destinos (requieren sesión; se guardan en PostgreSQL).
app.use('/api/resenas', resenasRouter);

app.use('/api/destinos', destinosRouter);

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
