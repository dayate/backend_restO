import { Hono } from 'hono';
import { db } from '../../config/database';
import { users } from '../../models/schema';
import { eq } from 'drizzle-orm';
import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';

const app = new Hono();

// POST /api/v1/admin/login - Endpoint untuk login admin
app.post('/', async (c) => {
  try {
    const { username, password } = await c.req.json();

    // Validasi input
    if (!username || !password) {
      return c.json({
        success: false,
        message: 'Username dan password harus diisi'
      }, 400);
    }

    // Cari user di database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (!user) {
      return c.json({
        success: false,
        message: 'Username atau password salah'
      }, 401);
    }

    // Verifikasi password
    const isPasswordValid = await compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return c.json({
        success: false,
        message: 'Username atau password salah'
      }, 401);
    }

    // Buat token JWT
    const token = sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' }
    );

    return c.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      },
      message: 'Login berhasil'
    });
  } catch (error) {
    console.error('Error during login:', error);
    return c.json({
      success: false,
      message: 'Terjadi kesalahan saat login',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;