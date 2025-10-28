import { Hono } from 'hono';
import { db } from '../../config/database';
import { orders, orderItems, menuItems, payments } from '../../models/schema';
import { eq, desc, and, inArray } from 'drizzle-orm';
import logger from '../../utils/logger';

const app = new Hono();


// GET /api/v1/admin/orders - Mendapatkan semua pesanan
app.get('/', async (c) => {
  try {
    logger.info('Permintaan untuk mendapatkan semua pesanan diterima');
    
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
    
    logger.info({
      msg: 'Daftar pesanan berhasil diambil',
      count: orderList.length
    });
    
    return c.json({
      success: true,
      data: orderDetails,
      message: 'Daftar pesanan berhasil diambil'
    });
  } catch (error) {
    logger.error({
      msg: 'Error retrieving orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Juga log ke file error khusus
    const errorLogger = (await import('../../utils/errorLogger')).default;
    errorLogger.error({
      msg: 'Critical error retrieving orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
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

    logger.info({
      msg: 'Permintaan scan pesanan diterima',
      order_uid
    });

    // Validasi input
    if (!order_uid) {
      logger.warn({
        msg: 'Validasi gagal: Order UID harus diisi'
      });
      
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
      logger.warn({
        msg: 'Pesanan tidak ditemukan',
        order_uid
      });
      
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

    logger.info({
      msg: 'Detail pesanan berhasil diambil melalui scan',
      order_id: order.id,
      order_uid: order.orderUid
    });

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
    logger.error({
      msg: 'Error retrieving order details via scan',
      error: error instanceof Error ? error.message : 'Unknown error',
      order_uid: await c.req.json().then(data => data.order_uid).catch(() => 'unknown')
    });
    
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

    logger.info({
      msg: 'Permintaan konfirmasi pembayaran tunai diterima',
      order_id: id
    });

    // Cek apakah pesanan ada
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    
    if (!order) {
      logger.warn({
        msg: 'Gagal mengkonfirmasi pembayaran: Pesanan tidak ditemukan',
        order_id: id
      });
      
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

    logger.info({
      msg: 'Pembayaran tunai berhasil dikonfirmasi',
      order_id: id,
      old_status: order.status,
      new_status: 'dikonfirmasi'
    });

    return c.json({
      success: true,
      message: 'Pembayaran tunai berhasil dikonfirmasi'
    });
  } catch (error) {
    logger.error({
      msg: 'Error confirming payment',
      error: error instanceof Error ? error.message : 'Unknown error',
      order_id: id
    });
    
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

    logger.info({
      msg: 'Permintaan detail pesanan berdasarkan ID diterima',
      order_id: id
    });

    // Cari pesanan berdasarkan ID
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) {
      logger.warn({
        msg: 'Gagal mengambil detail pesanan: Pesanan tidak ditemukan',
        order_id: id
      });
      
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

    logger.info({
      msg: 'Detail pesanan berhasil diambil',
      order_id: id
    });

    return c.json({
      success: true,
      data: orderDetails,
      message: 'Detail pesanan berhasil diambil'
    });
  } catch (error) {
    logger.error({
      msg: 'Error retrieving order details',
      error: error instanceof Error ? error.message : 'Unknown error',
      order_id: id
    });
    
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

    logger.info({
      msg: 'Permintaan update status pesanan diterima',
      order_id: id,
      new_status: status
    });

    // Validasi input
    if (!status) {
      logger.warn({
        msg: 'Validasi gagal: Status harus diisi',
        order_id: id
      });
      
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
      logger.warn({
        msg: 'Validasi gagal: Status tidak valid',
        order_id: id,
        status
      });
      
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
      logger.warn({
        msg: 'Gagal mengupdate status: Pesanan tidak ditemukan',
        order_id: id
      });
      
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

    logger.info({
      msg: 'Status pesanan berhasil diperbarui',
      order_id: id,
      old_status: order.status,
      new_status: status
    });

    return c.json({
      success: true,
      message: `Status pesanan berhasil diperbarui menjadi ${status}`
    });
  } catch (error) {
    logger.error({
      msg: 'Error updating order status',
      error: error instanceof Error ? error.message : 'Unknown error',
      order_id: id,
      status: await c.req.json().then(data => data.status).catch(() => 'unknown')
    });
    
    return c.json({
      success: false,
      message: 'Gagal memperbarui status pesanan',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;