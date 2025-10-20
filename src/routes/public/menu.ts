import { Hono } from 'hono';
import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { menuItems } from '../../models/schema';
import { eq } from 'drizzle-orm';

const app = new Hono();

// Fungsi untuk membuat koneksi database baru
const createDBConnection = async () => {
  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "restodb",
    ssl: false, // Disable SSL for local development
  });

  await client.connect();
  return drizzle(client);
};

// GET /api/v1/menu - Mengambil semua item menu yang tersedia
app.get('/', async (c) => {
  let client;
  try {
    const db = await createDBConnection();
    client = db.session.client;
    
    // Ambil semua item menu yang tersedia
    const availableMenuItems = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.isAvailable, true));
    
    return c.json({
      success: true,
      data: availableMenuItems,
      message: 'Menu items retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving menu items:', error);
    return c.json({
      success: false,
      message: 'Failed to retrieve menu items',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  } finally {
    // Tutup koneksi setelah selesai
    if (client) {
      await client.end();
    }
  }
});

export default app;