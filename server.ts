import { Hono } from 'hono';
import publicRoutes from './src/routes';
import { Client } from 'pg';

// Initialize app
const app = new Hono();

// Basic route
app.get('/', (c) => {
  return c.text('Hello RestoMenu Backend!');
});

// Register public routes
app.route('/', publicRoutes);

// Define port
const port = parseInt(process.env.PORT || '3000');

// Start server
console.log(`Server is running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};