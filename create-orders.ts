import { Client } from 'pg';

// Skrip untuk membuat data pesanan contoh
const createSampleOrders = async () => {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'restodb',
    ssl: false, // Disable SSL for local development
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Ambil ID menu items yang tersedia untuk membuat pesanan contoh
    const menuResult = await client.query('SELECT id FROM menu_items LIMIT 5');
    const menuIds = menuResult.rows.map((row: any) => row.id);

    if (menuIds.length === 0) {
      console.log('No menu items found. Please create sample menu items first.');
      return;
    }

    // Cek apakah pesanan sudah ada
    const checkOrdersResult = await client.query('SELECT COUNT(*) FROM orders');
    const ordersCount = parseInt(checkOrdersResult.rows[0].count);

    if (ordersCount > 0) {
      console.log(`Orders already exist (${ordersCount} orders), skipping creation`);
      return;
    }

    // Daftar status pesanan yang valid
    const validStatuses = [
      'menunggu_pembayaran',
      'menunggu_konfirmasi',
      'dikonfirmasi',
      'sedang_dipersiapkan',
      'siap_diambil',
      'selesai',
      'dibatalkan'
    ];

    // Daftar metode pembayaran
    const paymentMethods = ['qris', 'cash'];

    // Buat beberapa pesanan contoh
    const sampleOrders = [
      {
        status: 'sedang_dipersiapkan',
        totalAmount: '65000',
        paymentMethod: 'qris',
        tableNumber: 'A1'
      },
      {
        status: 'dikonfirmasi',
        totalAmount: '30000',
        paymentMethod: 'cash',
        tableNumber: 'B3'
      },
      {
        status: 'menunggu_pembayaran',
        totalAmount: '45000',
        paymentMethod: 'qris',
        tableNumber: 'C5'
      },
      {
        status: 'selesai',
        totalAmount: '77000',
        paymentMethod: 'cash',
        tableNumber: 'A2'
      },
      {
        status: 'siap_diambil',
        totalAmount: '25000',
        paymentMethod: 'qris',
        tableNumber: 'D4'
      }
    ];

    // Masukkan pesanan contoh ke database
    for (const order of sampleOrders) {
      // Validasi status
      if (!validStatuses.includes(order.status)) {
        console.error(`Invalid status: ${order.status}`);
        continue;
      }

      // Validasi metode pembayaran
      if (!paymentMethods.includes(order.paymentMethod)) {
        console.error(`Invalid payment method: ${order.paymentMethod}`);
        continue;
      }

      // Buat pesanan
      const orderResult = await client.query(
        'INSERT INTO orders (status, total_amount, payment_method, table_number) VALUES ($1, $2, $3, $4) RETURNING id',
        [order.status, order.totalAmount, order.paymentMethod, order.tableNumber]
      );

      const orderId = orderResult.rows[0].id;

      // Tambahkan item pesanan secara acak
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 item per pesanan
      for (let i = 0; i < numItems; i++) {
        const randomMenuId = menuIds[Math.floor(Math.random() * menuIds.length)];
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity

        // Ambil harga menu saat ini untuk disimpan di item pesanan
        const menuItemResult = await client.query(
          'SELECT price FROM menu_items WHERE id = $1',
          [randomMenuId]
        );
        
        if (menuItemResult.rows.length > 0) {
          const menuItemPrice = menuItemResult.rows[0].price;

          await client.query(
            'INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_order) VALUES ($1, $2, $3, $4)',
            [orderId, randomMenuId, quantity, menuItemPrice]
          );
        }
      }
    }

    console.log(`${sampleOrders.length} sample orders created successfully`);
    console.log('Sample orders:');
    sampleOrders.forEach((order, index) => {
      console.log(`${index + 1}. Status: ${order.status}, Total: Rp ${order.totalAmount}, Payment: ${order.paymentMethod}, Table: ${order.tableNumber}`);
    });
  } catch (error) {
    console.error('Error creating sample orders:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
};

createSampleOrders();