import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { validateRegisterInput, validateLoginInput } from '../validators/auth.validators.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  createGoogleUser,
  linkGoogleIdToUser,
} from '../models/user.model.js';
import { signAuthToken } from '../utils/token.js';
import { config } from '../config/env.js';

const SALT_ROUNDS = 12;
const googleClient = config.google.clientId ? new OAuth2Client(config.google.clientId) : null;

export async function register(req, res) {
  const { valid, errors, data } = validateRegisterInput(req.body);

  if (!valid) {
    return res.status(400).json({ errors });
  }

  const { fullName, email, password } = data;

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      // 409 Conflict: el correo ya está registrado.
      return res.status(409).json({
        errors: { email: 'Ya existe una cuenta con este correo electrónico.' },
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await createUser({ fullName, email, passwordHash });

    const token = signAuthToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error('[auth.register] error:', err);
    return res.status(500).json({ error: 'No se pudo crear la cuenta. Intenta de nuevo.' });
  }
}

export async function login(req, res) {
  const { valid, errors, data } = validateLoginInput(req.body);

  if (!valid) {
    return res.status(400).json({ errors });
  }

  const { email, password } = data;

  try {
    const user = await findUserByEmail(email);

    // Mismo mensaje genérico si el correo no existe o la contraseña no
    // coincide, para no revelar qué correos están registrados.
    const genericError = { error: 'Correo o contraseña incorrectos.' };

    if (!user) {
      return res.status(401).json(genericError);
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json(genericError);
    }

    const token = signAuthToken(user);

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error('[auth.login] error:', err);
    return res.status(500).json({ error: 'No se pudo iniciar sesión. Intenta de nuevo.' });
  }
}

export async function googleAuth(req, res) {
  const { idToken } = req.body || {};

  if (!googleClient) {
    return res.status(501).json({
      error:
        'El inicio de sesión con Google no está configurado en el servidor (falta GOOGLE_CLIENT_ID).',
    });
  }

  if (typeof idToken !== 'string' || !idToken) {
    return res.status(400).json({ error: 'Falta el token de Google (idToken).' });
  }

  let payload;
  try {
    // Verifica la firma, el emisor y la audiencia del token directamente
    // con Google. Esto es lo único confiable: nunca decodifiques el JWT
    // manualmente sin verificarlo, porque cualquiera podría fabricar uno.
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.google.clientId,
    });
    payload = ticket.getPayload();
  } catch (err) {
    console.error('[auth.googleAuth] token inválido:', err.message);
    return res.status(401).json({ error: 'Token de Google inválido o expirado.' });
  }

  if (!payload || !payload.email) {
    return res.status(401).json({ error: 'Token de Google inválido.' });
  }

  if (payload.email_verified === false) {
    return res.status(401).json({ error: 'Tu correo de Google no está verificado.' });
  }

  const googleId = payload.sub;
  const email = payload.email;
  const fullName = payload.name || email.split('@')[0];

  try {
    // 1. ¿Ya existe alguien con este google_id? -> login directo.
    let user = await findUserByEmail(email);

    if (user && user.google_id && user.google_id !== googleId) {
      // Caso raro/edge: el email coincide pero el google_id no. No debería
      // pasar en la práctica; lo tratamos como error de seguridad.
      return res.status(409).json({ error: 'Este correo ya está asociado a otra cuenta de Google.' });
    }

    if (user && !user.google_id) {
      // 2. Ya existía una cuenta con contraseña y el mismo correo:
      // la vinculamos con Google en vez de crear una cuenta duplicada.
      user = await linkGoogleIdToUser(user.id, googleId);
    }

    if (!user) {
      // 3. Usuario totalmente nuevo vía Google.
      user = await createGoogleUser({ fullName, email, googleId });
    }

    const token = signAuthToken(user);

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error('[auth.googleAuth] error:', err);
    return res.status(500).json({ error: 'No se pudo iniciar sesión con Google.' });
  }
}

// Ejemplo de endpoint protegido: devuelve el usuario autenticado
// a partir del token (req.user lo llena el middleware requireAuth).
export async function me(req, res) {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    return res.status(200).json({
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error('[auth.me] error:', err);
    return res.status(500).json({ error: 'Error al obtener el usuario.' });
  }
}
