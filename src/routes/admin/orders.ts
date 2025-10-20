import { Hono } from 'hono';
import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { orders, orderItems, menuItems, payments } from '../../models/schema';
import { eq, desc, and, inArray } from 'drizzle-orm';

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

// GET /api/v1/admin/orders - Mendapatkan semua pesanan
app.get('/', async (c) => {
  let client;
  try {
    const db = await createDBConnection();
    client = db.session.client;
    
    const orderList = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));
    
    // Ambil detail pesanan untuk setiap pesanan
    const orderDetails = [];
    
    for (const order of orderList) {
      const items = await db
        .select({
          id: orderItems.id,
          quantity: orderItems.quantity,
          priceAtOrder: orderItems.priceAtOrder,
          menuItemId: orderItems.menuItemId,
          menuItemName: menuItems.name,
          menuItemPrice: menuItems.price,
        })
        .from(orderItems)
        .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
        .where(eq(orderItems.orderId, order.id));
      
      orderDetails.push({
        id: order.id,
        order_uid: order.orderUid,
        status: order.status,
        total_amount: order.totalAmount,
        payment_method: order.paymentMethod,
        table_number: order.tableNumber,
        created_at: order.createdAt,
        items: items
      });
    }
    
    return c.json({
      success: true,
      data: orderDetails,
      message: 'Daftar pesanan berhasil diambil'
    });
  } catch (error) {
    console.error('Error retrieving orders:', error);
    return c.json({
      success: false,
      message: 'Gagal mengambil daftar pesanan',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  } finally {
    // Tutup koneksi setelah selesai
    if (client) {
      await client.end();
    }
  }
});

// POST /api/v1/admin/orders/scan - Mendapatkan detail pesanan berdasarkan order UID
app.post('/scan', async (c) => {
  let client;
  try {
    const db = await createDBConnection();
    client = db.session.client;
    
    const { order_uid } = await c.req.json();

    // Validasi input
    if (!order_uid) {
      return c.json({
        success: false,
        message: 'Order UID harus diisi'
      }, 400);
    }

    // Cari pesanan berdasarkan order_uid
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderUid, order_uid));
    
    if (!order) {
      return c.json({
        success: false,
        message: 'Pesanan tidak ditemukan'
      }, 404);
    }

    // Ambil detail item pesanan
    const items = await db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        priceAtOrder: orderItems.priceAtOrder,
        menuItemId: orderItems.menuItemId,
        menuItemName: menuItems.name,
        menuItemPrice: menuItems.price,
      })
      .from(orderItems)
      .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(eq(orderItems.orderId, order.id));

    // Ambil informasi pembayaran terkait
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, order.id));

    return c.json({
      success: true,
      data: {
        id: order.id,
        order_uid: order.orderUid,
        status: order.status,
        total_amount: order.totalAmount,
        payment_method: order.paymentMethod,
        table_number: order.tableNumber,
        created_at: order.createdAt,
        items: items,
        payment: payment || null
      },
      message: 'Detail pesanan berhasil diambil'
    });
  } catch (error) {
    console.error('Error retrieving order details:', error);
    return c.json({
      success: false,
      message: 'Gagal mengambil detail pesanan',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  } finally {
    // Tutup koneksi setelah selesai
    if (client) {
      await client.end();
    }
  }
});

// PUT /api/v1/admin/orders/:id/confirm-payment - Konfirmasi pembayaran tunai
app.put('/:id/confirm-payment', async (c) => {
  let client;
  try {
    const db = await createDBConnection();
    client = db.session.client;
    
    const id = parseInt(c.req.param('id'));

    // Cek apakah pesanan ada
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    
    if (!order) {
      return c.json({
        success: false,
        message: 'Pesanan tidak ditemukan'
      }, 404);
    }

    // Update status pembayaran dan status pesanan
    await db
      .update(orders)
      .set({ 
        status: 'menunggu_konfirmasi', // Sesuaikan dengan status yang sesuai dalam workflow
      })
      .where(eq(orders.id, id));

    return c.json({
      success: true,
      message: 'Pembayaran tunai berhasil dikonfirmasi'
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return c.json({
      success: false,
      message: 'Gagal mengkonfirmasi pembayaran',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  } finally {
    // Tutup koneksi setelah selesai
    if (client) {
      await client.end();
    }
  }
});

// PUT /api/v1/admin/orders/:id/status - Update status pesanan
app.put('/:id/status', async (c) => {
  let client;
  try {
    const db = await createDBConnection();
    client = db.session.client;
    
    const id = parseInt(c.req.param('id'));
    const { status } = await c.req.json();

    // Validasi input
    if (!status) {
      return c.json({
        success: false,
        message: 'Status harus diisi'
      }, 400);
    }

    // Validasi status valid
    const validStatuses = [
      'menunggu_pembayaran', 
      'menunggu_konfirmasi', 
      'dikonfirmasi', 
      'sedang_dipersiapkan', 
      'siap_diambil', 
      'selesai', 
      'dibatalkan'
    ];
    
    if (!validStatuses.includes(status)) {
      return c.json({
        success: false,
        message: `Status tidak valid. Pilihan: ${validStatuses.join(', ')}`
      }, 400);
    }

    // Cek apakah pesanan ada
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    
    if (!order) {
      return c.json({
        success: false,
        message: 'Pesanan tidak ditemukan'
      }, 404);
    }

    // Update status pesanan
    await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id));

    return c.json({
      success: true,
      message: `Status pesanan berhasil diperbarui menjadi ${status}`
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return c.json({
      success: false,
      message: 'Gagal memperbarui status pesanan',
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