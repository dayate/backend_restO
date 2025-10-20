import { Hono } from 'hono';
import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { orders, orderItems, menuItems } from '../../models/schema';
import { eq, and, inArray, sum } from 'drizzle-orm';

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

// POST /api/v1/orders - Membuat pesanan baru dari pelanggan
app.post('/', async (c) => {
  let client;
  try {
    const db = await createDBConnection();
    client = db.session.client;
    
    const { items, payment_method, table_number } = await c.req.json();

    // Validasi input
    if (!Array.isArray(items) || items.length === 0) {
      return c.json({
        success: false,
        message: 'Items are required and must be a non-empty array'
      }, 400);
    }

    if (!payment_method || !['qris', 'cash'].includes(payment_method)) {
      return c.json({
        success: false,
        message: 'Payment method is required and must be either "qris" or "cash"'
      }, 400);
    }

    // Validasi item pesanan
    for (const item of items) {
      if (typeof item.menu_item_id !== 'number' || typeof item.quantity !== 'number' || item.quantity <= 0) {
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
    console.error('Error creating order:', error);
    return c.json({
      success: false,
      message: 'Failed to create order',
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