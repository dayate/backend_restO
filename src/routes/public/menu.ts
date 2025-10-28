import { Hono } from 'hono';
import { db } from '../../config/database';
import { menuItems } from '../../models/schema';
import { eq } from 'drizzle-orm';

const app = new Hono();

// GET /api/v1/menu - Mengambil semua item menu yang tersedia
app.get('/', async (c) => {
  try {
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
  }
});

export default app;