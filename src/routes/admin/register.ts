import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { lucia } from '../../lib/lucia';
import { db } from '../../config/database';
import { users } from '../../models/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../../utils/auth';

const app = new Hono();

// POST /api/v1/admin/register - Endpoint untuk registrasi admin
app.post('/register', async (c) => {
  try {
    const { username, password, role = 'cashier' } = await c.req.json();

    // Validasi input
    if (!username || !password) {
      return c.json({
        success: false,
        message: 'Username dan password harus diisi'
      }, 400);
    }

    if (password.length < 6) {
      return c.json({
        success: false,
        message: 'Password harus minimal 6 karakter'
      }, 400);
    }

    // Cek apakah username sudah ada
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (existingUser.length > 0) {
      return c.json({
        success: false,
        message: 'Username sudah digunakan'
      }, 409);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Buat user baru
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        passwordHash,
        role
      })
      .returning();

    // Buat sesi Lucia
    const session = await lucia.createSession(newUser.id, {
      userId: newUser.id,
      username: newUser.username,
      role: newUser.role
    });
    
    // Set cookie sesi
    const sessionCookie = lucia.createSessionCookie(session.id);
    setCookie(c, sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return c.json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role
        }
      },
      message: 'Registrasi berhasil'
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return c.json({
      success: false,
      message: 'Terjadi kesalahan saat registrasi',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;