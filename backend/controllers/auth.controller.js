import bcrypt from 'bcryptjs';
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByIdWithPassword,
  updateUserPassword,
  updateUserProfile,
} from '../models/user.model.js';
import { uploadBufferToCloudinary } from '../utils/cloudinary.js';
import { signAuthToken } from '../utils/token.js';

const SALT_ROUNDS = 12;

function toUserDto(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    location: user.location || '',
    bio: user.bio || '',
    avatarUrl: user.avatar_url || '',
    isAdmin: Boolean(user.is_admin),
    authProvider: user.auth_provider || 'password',
    createdAt: user.created_at,
    passwordUpdatedAt: user.password_updated_at || null,
  };
}

export async function register(req, res) {
  const { fullName, email, password } = req.body;

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({
        errors: { email: 'Ya existe una cuenta con este correo electrónico.' },
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await createUser({ fullName, email, passwordHash });

    const token = signAuthToken(user);

    return res.status(201).json({
      token,
      user: toUserDto(user),
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

    const genericError = { error: 'Correo o contraseña incorrectos.' };

    if (!user || !user.password_hash) {
      return res.status(401).json(genericError);
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json(genericError);
    }

    const token = signAuthToken(user);

    return res.status(200).json({
      token,
      user: toUserDto(user),
    });
  } catch (err) {
    console.error('[auth.login] error:', err);
    return res.status(500).json({ error: 'No se pudo iniciar sesión. Intenta de nuevo.' });
  }
}

export async function me(req, res) {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    return res.status(200).json({ user: toUserDto(user) });
  } catch (err) {
    console.error('[auth.me] error:', err);
    return res.status(500).json({ error: 'Error al obtener el usuario.' });
  }
}

export async function updateProfile(req, res) {
  const { fullName, email, location, bio } = req.body;

  try {
    const existing = await findUserByEmail(email);
    if (existing && existing.id !== req.user.id) {
      return res.status(409).json({
        errors: { email: 'Ya existe una cuenta con este correo electrónico.' },
      });
    }

    let avatarUrl = null;
    if (req.file) {
      avatarUrl = await uploadBufferToCloudinary(
        req.file.buffer,
        'tudestino/avatars',
        req.file.mimetype || 'image/jpeg'
      );
    }

    const user = await updateUserProfile(req.user.id, {
      fullName,
      email,
      location: location || null,
      bio: bio || null,
      avatarUrl,
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    return res.status(200).json({
      user: toUserDto(user),
      message: 'Perfil actualizado correctamente.',
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        errors: { email: 'Ya existe una cuenta con este correo electrónico.' },
      });
    }
    console.error('[auth.updateProfile] error:', err);
    return res.status(500).json({ error: 'No se pudo actualizar el perfil. Intenta de nuevo.' });
  }
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await findUserByIdWithPassword(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    if (!user.password_hash) {
      return res.status(400).json({
        errors: {
          currentPassword: 'Esta cuenta no tiene una contraseña local. Inicia sesión con Google.',
        },
      });
    }

    const passwordMatches = await bcrypt.compare(currentPassword, user.password_hash);
    if (!passwordMatches) {
      return res.status(400).json({
        errors: { currentPassword: 'La contraseña actual no es correcta.' },
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const updated = await updateUserPassword(req.user.id, passwordHash);

    return res.status(200).json({
      user: toUserDto(updated),
      message: 'Contraseña actualizada correctamente.',
    });
  } catch (err) {
    console.error('[auth.changePassword] error:', err);
    return res.status(500).json({ error: 'No se pudo cambiar la contraseña. Intenta de nuevo.' });
  }
}
