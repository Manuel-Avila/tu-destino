import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export function signAuthToken(user) {
  // Nunca metas password_hash ni datos sensibles en el payload del token.
  return jwt.sign(
    { sub: user.id, email: user.email },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

export function verifyAuthToken(token) {
  return jwt.verify(token, config.jwt.secret);
}
