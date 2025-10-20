import { MiddlewareHandler } from 'hono';
import { verify } from 'jsonwebtoken';
import { Context } from 'hono';

export const authMiddleware: MiddlewareHandler = async (c: Context, next: () => Promise<void>) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({
        success: false,
        message: 'Akses ditolak: Token tidak ditemukan'
      }, 401);
    }

    const token = authHeader.substring(7); // Hapus 'Bearer ' dari header

    // Verifikasi token
    const decoded = verify(token, process.env.JWT_SECRET || 'fallback_secret_key') as {
      userId: number;
      username: string;
      role: string;
    };

    // Tambahkan informasi user ke context
    c.set('user', decoded);

    // Lanjutkan ke handler berikutnya
    await next();
  } catch (error) {
    console.error('Authentication error:', error);
    return c.json({
      success: false,
      message: 'Akses ditolak: Token tidak valid'
    }, 401);
  }
};