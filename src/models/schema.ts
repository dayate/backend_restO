import { pgTable, serial, varchar, text, decimal, boolean, timestamp, integer, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Menu Items table
export const menuItems = pgTable('menu_items', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  category: varchar('category', { length: 100 }),
  imageUrl: varchar('image_url', { length: 255 }),
  isAvailable: boolean('is_available').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Orders table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderUid: uuid('order_uid').default(sql`gen_random_uuid()`),
  status: varchar('status', { length: 50 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  tableNumber: varchar('table_number', { length: 10 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Order Items table (junction table)
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }),
  menuItemId: integer('menu_item_id').references(() => menuItems.id),
  quantity: integer('quantity').notNull(),
  priceAtOrder: decimal('price_at_order', { precision: 10, scale: 2 }).notNull(),
});

// Payments table
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id),
  midtransTransactionId: varchar('midtrans_transaction_id', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentTimestamp: timestamp('payment_timestamp', { withTimezone: true }).defaultNow(),
});

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).default('cashier'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});