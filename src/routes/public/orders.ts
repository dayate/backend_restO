import { Hono } from 'hono';
import { db } from '../../config/database';
import { orders, orderItems, menuItems } from '../../models/schema';
import { eq, and, inArray, sum } from 'drizzle-orm';
import logger from '../../utils/logger';

const app = new Hono();

// POST /api/v1/orders - Membuat pesanan baru dari pelanggan
app.post('/', async (c) => {
  try {
    logger.info('Proses membuat pesanan baru dimulai');
    
    const { items, payment_method, table_number } = await c.req.json();

    // Validasi input
    if (!Array.isArray(items) || items.length === 0) {
      logger.warn({
        msg: 'Validasi gagal: Items are required and must be a non-empty array'
      });
      
      return c.json({
        success: false,
        message: 'Items are required and must be a non-empty array'
      }, 400);
    }

    if (!payment_method || !['qris', 'cash'].includes(payment_method)) {
      logger.warn({
        msg: 'Validasi gagal: Payment method is required and must be either "qris" or "cash"',
        payment_method
      });
      
      return c.json({
        success: false,
        message: 'Payment method is required and must be either "qris" or "cash"'
      }, 400);
    }

    // Validasi item pesanan
    for (const item of items) {
      if (typeof item.menu_item_id !== 'number' || typeof item.quantity !== 'number' || item.quantity <= 0) {
        logger.warn({
          msg: 'Validasi gagal: Each item must have a valid menu_item_id (number) and quantity (positive number)',
          item
        });
        
        return c.json({
          success: false,
          message: 'Each item must have a valid menu_item_id (number) and quantity (positive number)'
        }, 400);
      }
    }

    // Ambil detail item menu untuk verifikasi harga
    const menuItemIds = items.map(item => item.menu_item_id);
    const menuItemsResult = await db
      .select()
      .from(menuItems)
      .where(inArray(menuItems.id, menuItemIds));

    // Buat map dari id menu ke detail menu
    const menuItemMap = new Map();
    menuItemsResult.forEach(item => {
      menuItemMap.set(item.id, item);
    });

    // Validasi bahwa semua item menu tersedia
    for (const item of items) {
      const menuItem = menuItemMap.get(item.menu_item_id);
      if (!menuItem || !menuItem.isAvailable) {
        logger.warn({
          msg: `Menu item with id ${item.menu_item_id} is not available`,
          menu_item_id: item.menu_item_id
        });
        
        return c.json({
          success: false,
          message: `Menu item with id ${item.menu_item_id} is not available`
        }, 400);
      }
    }

    // Hitung total harga
    let totalAmount = 0;
    for (const item of items) {
      const menuItem = menuItemMap.get(item.menu_item_id);
      if (menuItem) {
        totalAmount += parseFloat(menuItem.price) * item.quantity;
      }
    }

    logger.info({
      msg: 'Proses membuat pesanan ke database dimulai',
      total_amount: totalAmount,
      payment_method,
      items_count: items.length
    });

    // Buat transaksi untuk membuat pesanan dan item pesanan
    const newOrder = await db.transaction(async (trx) => {
      // Buat pesanan baru
      const [order] = await trx
        .insert(orders)
        .values({
          status: 'menunggu_pembayaran', // Status awal
          totalAmount: totalAmount.toString(), // Drizzle ORM menggunakan string untuk decimal
          paymentMethod: payment_method,
          tableNumber: table_number || null,
        })
        .returning();

      // Buat item pesanan
      for (const item of items) {
        const menuItem = menuItemMap.get(item.menu_item_id);
        await trx.insert(orderItems).values({
          orderId: order.id,
          menuItemId: item.menu_item_id,
          quantity: item.quantity,
          priceAtOrder: menuItem.price, // Gunakan harga pada saat pemesanan
        });
      }

      return order;
    });

    logger.info({
      msg: 'Pesanan berhasil dibuat',
      order_id: newOrder.id,
      order_uid: newOrder.orderUid,
      total_amount: newOrder.totalAmount
    });

    return c.json({
      success: true,
      data: {
        id: newOrder.id,
        order_uid: newOrder.orderUid,
        status: newOrder.status,
        total_amount: newOrder.totalAmount,
        payment_method: newOrder.paymentMethod,
        table_number: newOrder.tableNumber,
        created_at: newOrder.createdAt
      },
      message: 'Order created successfully'
    }, 201);
  } catch (error) {
    logger.error({
      msg: 'Error creating order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Juga log ke file error khusus
    const errorLogger = (await import('../../utils/errorLogger')).default;
    errorLogger.error({
      msg: 'Critical error creating order',
      error: error instanceof Error ? error.message : 'Unknown error',
      items: items || 'unknown',
      payment_method: payment_method || 'unknown'
    });
    
    return c.json({
      success: false,
      message: 'Failed to create order',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;