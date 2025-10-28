import { Hono } from 'hono';
import { db } from '../../config/database';
import { menuItems, orderItems } from '../../models/schema';
import { eq, desc } from 'drizzle-orm';

const app = new Hono();

// GET /api/v1/admin/menu - Mendapatkan semua item menu
app.get('/', async (c) => {
  try {
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
  }
});

// POST /api/v1/admin/menu - Membuat item menu baru
app.post('/', async (c) => {
  try {
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
  }
});

// PUT /api/v1/admin/menu/:id - Mengupdate item menu
app.put('/:id', async (c) => {
  try {
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
  }
});

// PUT /api/v1/admin/menu/:id/availability - Memperbarui status ketersediaan item menu
app.put('/:id/availability', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { is_available } = await c.req.json();

    // Validasi input
    if (is_available === undefined) {
      return c.json({
        success: false,
        message: 'Status ketersediaan harus disertakan (is_available)'
      }, 400);
    }

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

    // Update status ketersediaan
    await db
      .update(menuItems)
      .set({ isAvailable: Boolean(is_available) })
      .where(eq(menuItems.id, id));

    const statusText = Boolean(is_available) ? 'tersedia' : 'tidak tersedia';
    return c.json({
      success: true,
      message: `Status ketersediaan item menu berhasil diperbarui menjadi ${statusText}`
    });
  } catch (error) {
    console.error('Error updating menu item availability:', error);
    return c.json({
      success: false,
      message: 'Gagal memperbarui status ketersediaan item menu',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// DELETE /api/v1/admin/menu/:id - Menghapus item menu secara permanen
app.delete('/:id', async (c) => {
  try {
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

    // Cek apakah item menu sedang digunakan dalam pesanan
    const usageCheck = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.menuItemId, id))
      .limit(1);

    if (usageCheck.length > 0) {
      return c.json({
        success: false,
        message: 'Tidak dapat menghapus item menu karena sedang digunakan dalam pesanan'
      }, 400);
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
  }
});

export default app;