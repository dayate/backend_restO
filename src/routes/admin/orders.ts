import { Hono } from 'hono';
import { db } from '../../config/database';
import { orders, orderItems, menuItems, payments } from '../../models/schema';
import { eq, desc, and, inArray } from 'drizzle-orm';

const app = new Hono();


// GET /api/v1/admin/orders - Mendapatkan semua pesanan
app.get('/', async (c) => {
  try {
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
  }
});

// POST /api/v1/admin/orders/scan - Mendapatkan detail pesanan berdasarkan order UID
app.post('/scan', async (c) => {
  try {
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
  }
});

// PUT /api/v1/admin/orders/:id/confirm-payment - Konfirmasi pembayaran tunai
app.put('/:id/confirm-payment', async (c) => {
  try {
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
        status: 'dikonfirmasi', // Perbaikan: untuk pembayaran tunai, ubah langsung ke 'dikonfirmasi'
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
  }
});

// GET /api/v1/admin/orders/:id - Mendapatkan detail pesanan berdasarkan ID
app.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));

    // Cari pesanan berdasarkan ID
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) {
      return c.json({
        success: false,
        message: 'Pesanan tidak ditemukan'
      }, 404);
    }

    // Ambil item pesanan
    const orderItemsResult = await db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        priceAtOrder: orderItems.priceAtOrder,
        menuItemId: orderItems.menuItemId,
        menuItemName: menuItems.name,
        menuItemDescription: menuItems.description,
        menuItemPrice: menuItems.price,
        menuItemCategory: menuItems.category,
        menuItemImageUrl: menuItems.imageUrl
      })
      .from(orderItems)
      .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(eq(orderItems.orderId, order.id));

    // Ambil informasi pembayaran terkait
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, order.id));

    // Bangun response dengan detail pesanan dan itemnya
    const orderDetails = {
      id: order.id,
      order_uid: order.orderUid,
      status: order.status,
      total_amount: order.totalAmount,
      payment_method: order.paymentMethod,
      table_number: order.tableNumber,
      created_at: order.createdAt,
      items: orderItemsResult.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price_at_order: item.priceAtOrder,
        menu_item: {
          id: item.menuItemId,
          name: item.menuItemName,
          description: item.menuItemDescription,
          price: item.menuItemPrice,
          category: item.menuItemCategory,
          image_url: item.menuItemImageUrl
        }
      })),
      payment: payment || null
    };

    return c.json({
      success: true,
      data: orderDetails,
      message: 'Detail pesanan berhasil diambil'
    });
  } catch (error) {
    console.error('Error retrieving order details:', error);
    return c.json({
      success: false,
      message: 'Gagal mengambil detail pesanan',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// PUT /api/v1/admin/orders/:id/status - Update status pesanan
app.put('/:id/status', async (c) => {
  try {
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
  }
});

export default app;