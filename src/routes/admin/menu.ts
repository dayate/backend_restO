import { Hono } from 'hono';
import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { menuItems } from '../../models/schema';
import { eq, desc } from 'drizzle-orm';

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

// GET /api/v1/admin/menu - Mendapatkan semua item menu
app.get('/', async (c) => {
  let client;
  try {
    const db = await createDBConnection();
    client = db.session.client;
    
    const menuList = await db
      .select()
      .from(menuItems)
      .orderBy(desc(menuItems.createdAt));
    
    return c.json({
      success: true,
      data: menuList,
      message: 'Daftar menu berhasil diambil'
    });
  } catch (error) {
    console.error('Error retrieving menu items:', error);
    return c.json({
      success: false,
      message: 'Gagal mengambil daftar menu',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  } finally {
    // Tutup koneksi setelah selesai
    if (client) {
      await client.end();
    }
  }
});

// POST /api/v1/admin/menu - Membuat item menu baru
app.post('/', async (c) => {
  let client;
  try {
    const db = await createDBConnection();
    client = db.session.client;
    
    const { name, description, price, category, image_url, is_available } = await c.req.json();

    // Validasi input
    if (!name || !price) {
      return c.json({
        success: false,
        message: 'Nama dan harga harus diisi'
      }, 400);
    }

    // Validasi tipe data
    if (typeof price !== 'string' && typeof price !== 'number') {
      return c.json({
        success: false,
        message: 'Harga harus berupa angka'
      }, 400);
    }

    // Buat item menu baru
    const [newMenuItem] = await db
      .insert(menuItems)
      .values({
        name,
        description: description || null,
        price: price.toString(), // Drizzle ORM menggunakan string untuk decimal
        category: category || null,
        imageUrl: image_url || null,
        isAvailable: is_available !== undefined ? is_available : true,
      })
      .returning();

    return c.json({
      success: true,
      data: newMenuItem,
      message: 'Item menu berhasil ditambahkan'
    }, 201);
  } catch (error) {
    console.error('Error creating menu item:', error);
    return c.json({
      success: false,
      message: 'Gagal menambahkan item menu',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  } finally {
    // Tutup koneksi setelah selesai
    if (client) {
      await client.end();
    }
  }
});

// PUT /api/v1/admin/menu/:id - Mengupdate item menu
app.put('/:id', async (c) => {
  let client;
  try {
    const db = await createDBConnection();
    client = db.session.client;
    
    const id = parseInt(c.req.param('id'));
    const { name, description, price, category, image_url, is_available } = await c.req.json();

    // Cek apakah item menu ada
    const [existingItem] = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, id));

    if (!existingItem) {
      return c.json({
        success: false,
        message: 'Item menu tidak ditemukan'
      }, 404);
    }

    // Validasi minimal input
    if (name === undefined && description === undefined && price === undefined && 
        category === undefined && image_url === undefined && is_available === undefined) {
      return c.json({
        success: false,
        message: 'Tidak ada data yang diperbarui'
      }, 400);
    }

    // Update item menu
    const updatedValues: any = {};
    if (name !== undefined) updatedValues.name = name;
    if (description !== undefined) updatedValues.description = description;
    if (price !== undefined) updatedValues.price = price.toString();
    if (category !== undefined) updatedValues.category = category;
    if (image_url !== undefined) updatedValues.imageUrl = image_url;
    if (is_available !== undefined) updatedValues.isAvailable = is_available;

    const [updatedItem] = await db
      .update(menuItems)
      .set(updatedValues)
      .where(eq(menuItems.id, id))
      .returning();

    return c.json({
      success: true,
      data: updatedItem,
      message: 'Item menu berhasil diperbarui'
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return c.json({
      success: false,
      message: 'Gagal memperbarui item menu',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  } finally {
    // Tutup koneksi setelah selesai
    if (client) {
      await client.end();
    }
  }
});

// DELETE /api/v1/admin/menu/:id - Menghapus item menu
app.delete('/:id', async (c) => {
  let client;
  try {
    const db = await createDBConnection();
    client = db.session.client;
    
    const id = parseInt(c.req.param('id'));

    // Cek apakah item menu ada
    const [existingItem] = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, id));

    if (!existingItem) {
      return c.json({
        success: false,
        message: 'Item menu tidak ditemukan'
      }, 404);
    }

    // Hapus item menu
    await db
      .delete(menuItems)
      .where(eq(menuItems.id, id));

    return c.json({
      success: true,
      message: 'Item menu berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return c.json({
      success: false,
      message: 'Gagal menghapus item menu',
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