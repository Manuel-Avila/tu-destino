import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  db: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};

// Fail fast if critical secrets are missing (except in test env).
if (!config.jwt.secret && process.env.NODE_ENV !== 'test') {
  console.warn(
    '[config] ADVERTENCIA: JWT_SECRET no está definido. Define esta variable en tu .env antes de usar auth en producción.'
  );
}
