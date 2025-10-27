import { Client } from 'pg';

// Database setup script
const setupDatabase = async () => {
  // Connect to default postgres database first
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    database: 'postgres', // Connect to default postgres database to create new database
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL server');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'restodb';
    const checkDBQuery = `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`;
    const dbExists = await client.query(checkDBQuery);

    if (dbExists.rowCount === 0) {
      // Create the database
      await client.query(`CREATE DATABASE "${dbName}";`);
      console.log(`Database "${dbName}" created successfully`);
    } else {
      console.log(`Database "${dbName}" already exists`);
    }

    // Close the connection
    await client.end();
    console.log('Connection closed');
    
    console.log('\nNext steps:');
    console.log('1. Run: bunx drizzle-kit generate');
    console.log('2. Run: bunx drizzle-kit migrate');
    console.log('3. Run: bun run index.ts');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
};

setupDatabase();