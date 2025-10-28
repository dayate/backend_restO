import { Hono } from 'hono';
import { db } from '../../config/database';
import { menuItems } from '../../models/schema';
import { eq } from 'drizzle-orm';
import logger from '../../utils/logger';

const app = new Hono();

// GET /api/v1/menu - Mengambil semua item menu yang tersedia
app.get('/', async (c) => {
  try {
    logger.info('Mengambil semua item menu yang tersedia');
    
    // Ambil semua item menu yang tersedia
    const availableMenuItems = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.isAvailable, true));
    
    logger.info({
      msg: 'Berhasil mengambil item menu',
      count: availableMenuItems.length
    });
    
    return c.json({
      success: true,
      data: availableMenuItems,
      message: 'Menu items retrieved successfully'
    });
  } catch (error) {
    logger.error({
      msg: 'Error retrieving menu items',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return c.json({
      success: false,
      message: 'Failed to retrieve menu items',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;