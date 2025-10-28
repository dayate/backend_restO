import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import menuRoutes from './public/menu';
import locationRoutes from './public/location';
import orderRoutes from './public/orders';
import getOrderDetail from './public/order-detail';
import adminAuthRoute from './admin/auth';
import adminMenuRoute from './admin/menu';
import adminOrderRoute from './admin/orders';
import { db } from '../config/database';
import { users } from '../models/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../utils/auth';
import { sign } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import logger from '../utils/logger';

const app = new Hono();

// Route publik
app.route('/api/v1/menu', menuRoutes);
app.route('/api/v1/location-check', locationRoutes);
app.route('/api/v1/orders', orderRoutes);
app.get('/api/v1/orders/:order_uid', getOrderDetail);

// Route admin register - TANPA otentikasi
app.post('/api/v1/admin/register', async (c) => {
  try {
    logger.info('Proses registrasi admin dimulai');
    
    // Baca body sebagai text untuk menghindari error parsing langsung
    const rawBody = await c.req.text();
    
    // Bersihkan body dari karakter yang tidak seharusnya (jika ada bagian sintaks REST Client ikut terkirim)
    const cleanBody = rawBody.split('> {')[0]; // Ambil bagian sebelum sintaks REST Client jika ikut terkirim
    
    let requestData;
    try {
      requestData = JSON.parse(cleanBody);
    } catch (parseError) {
      logger.error({
        msg: 'JSON Parse error during registration',
        error: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      });
      
      return c.json({
        success: false,
        message: 'Terjadi kesalahan saat parsing data JSON',
        error: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      }, 400);
    }

    const { username, password, role = 'cashier' } = requestData;

    // Validasi input
    if (!username || !password) {
      logger.warn({
        msg: 'Validasi gagal: Username dan password harus diisi',
        username
      });
      
      return c.json({
        success: false,
        message: 'Username dan password harus diisi'
      }, 400);
    }

    if (password.length < 6) {
      logger.warn({
        msg: 'Validasi gagal: Password harus minimal 6 karakter',
        username
      });
      
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
      logger.warn({
        msg: 'Username sudah digunakan',
        username
      });
      
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

    logger.info({
      msg: 'Registrasi admin berhasil',
      userId: newUser.id,
      username: newUser.username
    });

    // Buat token JWT
    const token = sign(
      { userId: newUser.id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' }
    );

    return c.json({
      success: true,
      data: {
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role
        }
      },
      message: 'Registrasi berhasil'
    });
  } catch (error) {
    logger.error({
      msg: 'Error during registration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Juga log ke file error khusus
    const errorLogger = (await import('../utils/errorLogger')).default;
    errorLogger.error({
      msg: 'Critical error during admin registration',
      error: error instanceof Error ? error.message : 'Unknown error',
      username: username || 'unknown'
    });
    
    return c.json({
      success: false,
      message: 'Terjadi kesalahan saat registrasi',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Route admin login - TANPA otentikasi
app.post('/api/v1/admin/login', async (c) => {
  let requestData;
  try {
    logger.info('Proses login admin dimulai');
    
    // Baca body sebagai text untuk menghindari error parsing langsung
    const rawBody = await c.req.text();
    
    // Bersihkan body dari karakter yang tidak seharusnya (jika ada bagian sintaks REST Client ikut terkirim)
    const cleanBody = rawBody.split('> {')[0]; // Ambil bagian sebelum sintaks REST Client jika ikut terkirim
    
    requestData = JSON.parse(cleanBody);
  } catch (parseError) {
    logger.error({
      msg: 'JSON Parse error during login',
      error: parseError instanceof Error ? parseError.message : 'Unknown parse error'
    });
    
    return c.json({
      success: false,
      message: 'Terjadi kesalahan saat parsing data JSON',
      error: parseError instanceof Error ? parseError.message : 'Unknown parse error'
    }, 400);
  }

  const { username, password } = requestData;

  // Validasi input
  if (!username || !password) {
    logger.warn({
      msg: 'Validasi gagal: Username dan password harus diisi',
      username
    });
    
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
    logger.warn({
      msg: 'Login gagal: Username tidak ditemukan',
      username
    });
    
    return c.json({
      success: false,
      message: 'Username atau password salah'
    }, 401);
  }

  // Verifikasi password
  const isPasswordValid = await compare(password, user.passwordHash);
  if (!isPasswordValid) {
    logger.warn({
      msg: 'Login gagal: Password salah',
      username
    });
    
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

  logger.info({
    msg: 'Login admin berhasil',
    userId: user.id,
    username: user.username
  });

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
});

// Route admin yang dilindungi - dengan otentikasi
// Cara ini memberlakukan middleware hanya pada path tertentu, bukan termasuk login
const adminApp = new Hono();
adminApp.use('*', authMiddleware); // terapkan otentikasi ke semua route di bawah ini
adminApp.route('/menu', adminMenuRoute);
adminApp.route('/orders', adminOrderRoute);

// Gabungkan aplikasi admin yang dilindungi ke aplikasi utama
app.route('/api/v1/admin', adminApp);

export default app;