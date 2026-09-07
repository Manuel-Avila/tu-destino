import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, findUserById } from '../models/user.model.js';
import { signAuthToken } from '../utils/token.js';

const SALT_ROUNDS = 12;

export async function register(req, res) {
  const { fullName, email, password } = req.body;

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({
        errors: { email: 'Ya existe una cuenta con este correo electrnico.' },
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
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);

    const genericError = { error: 'Correo o contrasea incorrectos.' };

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
    return res.status(500).json({ error: 'No se pudo iniciar sesin. Intenta de nuevo.' });
  }
}

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
