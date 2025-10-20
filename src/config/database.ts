import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

// Database connection configuration
const client = new Client({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "restodb",
  ssl: false, // Disable SSL for local development
});

export const connectDB = async () => {
  try {
    await client.connect();
    console.log("Database connected successfully");
    return drizzle(client);
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

export default client;
