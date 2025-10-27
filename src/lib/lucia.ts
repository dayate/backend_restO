import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '../config/database';
import { sessions, users } from '../models/schema';

// Inisialisasi adapter Lucia dengan Drizzle
const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

// Inisialisasi Lucia
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false, // sesi berakhir saat browser ditutup
    attributes: {
      secure: process.env.NODE_ENV === 'production', // gunakan secure hanya di production
      httpOnly: true,
      sameSite: 'strict' as const,
      path: '/'
    }
  },
  getUserAttributes: (userData) => {
    return {
      // definisikan atribut yang ingin Anda ambil dari tabel pengguna
      id: userData.id,
      username: userData.username,
      role: userData.role,
      createdAt: userData.createdAt
    };
  }
});

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  id: number;
  username: string;
  role: string;
  createdAt: Date;
}