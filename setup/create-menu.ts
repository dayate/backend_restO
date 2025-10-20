import { Client } from 'pg';

// Skrip untuk membuat daftar menu contoh
const createSampleMenu = async () => {
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

    // Daftar menu contoh
    const sampleMenuItems = [
      {
        name: 'Nasi Goreng Spesial',
        description: 'Nasi goreng dengan bumbu spesial, telur, dan kerupuk',
        price: '35000',
        category: 'Makanan',
        image_url: 'https://example.com/nasi-goreng.jpg',
        is_available: true
      },
      {
        name: 'Ayam Goreng Kremes',
        description: 'Ayam goreng gurih dengan kremesan dan sambal bawang',
        price: '30000',
        category: 'Makanan',
        image_url: 'https://example.com/ayam-goreng.jpg',
        is_available: true
      },
      {
        name: 'Soto Ayam Lamongan',
        description: 'Soto ayam khas Lamongan dengan kuah kuning dan tambahan jeruk nipis',
        price: '25000',
        category: 'Makanan',
        image_url: 'https://example.com/soto-ayam.jpg',
        is_available: true
      },
      {
        name: 'Bakso Urat',
        description: 'Bakso besar dengan urat, kuah bening, dan mie kuning',
        price: '22000',
        category: 'Makanan',
        image_url: 'https://example.com/bakso.jpg',
        is_available: true
      },
      {
        name: 'Mie Ayam Jamur',
        description: 'Mie kuning dengan potongan ayam, jamur, dan pangsit',
        price: '27000',
        category: 'Makanan',
        image_url: 'https://example.com/mie-ayam.jpg',
        is_available: true
      },
      {
        name: 'Es Teh Manis',
        description: 'Teh dingin manis dengan es batu',
        price: '5000',
        category: 'Minuman',
        image_url: 'https://example.com/es-teh.jpg',
        is_available: true
      },
      {
        name: 'Jus Alpukat',
        description: 'Jus alpukat kental dengan susu dan gula',
        price: '18000',
        category: 'Minuman',
        image_url: 'https://example.com/jus-alpukat.jpg',
        is_available: true
      },
      {
        name: 'Es Campur',
        description: 'Campuran es serut dengan berbagai buah dan cincau',
        price: '15000',
        category: 'Minuman',
        image_url: 'https://example.com/es-campur.jpg',
        is_available: true
      },
      {
        name: 'Kerak Telor',
        description: 'Kerak telor khas Betawi dengan bumbu khas',
        price: '20000',
        category: 'Makanan',
        image_url: 'https://example.com/kerak-telor.jpg',
        is_available: false // Tidak tersedia untuk contoh
      },
      {
        name: 'Martabak Manis',
        description: 'Martabak manis dengan berbagai topping pilihan',
        price: '40000',
        category: 'Makanan',
        image_url: 'https://example.com/martabak-manis.jpg',
        is_available: true
      }
    ];

    // Cek apakah menu sudah ada
    const checkMenuResult = await client.query('SELECT COUNT(*) FROM menu_items');
    const menuCount = parseInt(checkMenuResult.rows[0].count);

    if (menuCount > 0) {
      console.log(`Menu items already exist (${menuCount} items), skipping creation`);
      return;
    }

    // Masukkan menu contoh ke database
    for (const menuItem of sampleMenuItems) {
      await client.query(
        'INSERT INTO menu_items (name, description, price, category, image_url, is_available) VALUES ($1, $2, $3, $4, $5, $6)',
        [menuItem.name, menuItem.description, menuItem.price, menuItem.category, menuItem.image_url, menuItem.is_available]
      );
    }

    console.log(`${sampleMenuItems.length} sample menu items created successfully`);
    console.log('Sample menu items:');
    sampleMenuItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} - Rp ${item.price} (${item.category})`);
    });
  } catch (error) {
    console.error('Error creating sample menu:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
};

createSampleMenu();