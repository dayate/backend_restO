import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { orders, orderItems, menuItems } from '../../models/schema';
import { eq } from 'drizzle-orm';
import { Context } from 'hono';

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

// GET /api/v1/orders/:order_uid - Mengambil status pesanan tertentu untuk pelanggan
const getOrderDetail = async (c: Context) => {
  let client;
  try {
    const order_uid = c.req.param('order_uid');
    const db = await createDBConnection();
    client = db.session.client;

    // Cari pesanan berdasarkan order_uid
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.orderUid, order_uid))
      .limit(1);

    if (order.length === 0) {
      return c.json({
        success: false,
        message: 'Order not found'
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
      .where(eq(orderItems.orderId, order[0].id));

    // Bangun response dengan detail pesanan dan itemnya
    const orderDetails = {
      id: order[0].id,
      order_uid: order[0].orderUid,
      status: order[0].status,
      total_amount: order[0].totalAmount,
      payment_method: order[0].paymentMethod,
      table_number: order[0].tableNumber,
      created_at: order[0].createdAt,
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
      }))
    };

    return c.json({
      success: true,
      data: orderDetails,
      message: 'Order details retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving order details:', error);
    return c.json({
      success: false,
      message: 'Failed to retrieve order details',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  } finally {
    // Tutup koneksi setelah selesai
    if (client) {
      await client.end();
    }
  }
};

export default getOrderDetail;