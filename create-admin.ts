import { Client } from 'pg';
import { hashPassword } from './src/utils/auth';

// Skrip untuk membuat pengguna admin awal
const createAdminUser = async () => {
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

    // Hash password default
    const password = 'admin123';
    const hashedPassword = await hashPassword(password);
    
    console.log('Password hashed successfully');

    // Cek apakah pengguna admin sudah ada
    const checkUserResult = await client.query(
      'SELECT * FROM users WHERE username = $1', 
      ['admin']
    );

    if (checkUserResult.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Buat pengguna admin
    await client.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
      ['admin', hashedPassword, 'admin']
    );

    console.log('Admin user created successfully');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Role: admin');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
};

createAdminUser();