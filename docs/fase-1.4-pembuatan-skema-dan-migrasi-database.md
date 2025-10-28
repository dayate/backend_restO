# Fase 1.4: Pembuatan Skema dan Migrasi Database

## Ringkasan
Pada fase ini, kita akan membuat skema database sesuai dengan spesifikasi teknis dan menjalankan migrasi pertama ke database PostgreSQL. Ini merupakan langkah penting untuk menyiapkan struktur database yang akan digunakan oleh aplikasi.

## Tujuan
- Membuat definisi skema database menggunakan Drizzle ORM
- Menjalankan migrasi database pertama
- Memastikan struktur tabel sesuai dengan spesifikasi teknis

## Skema Database
Berdasarkan tech-spec.md, kita akan membuat tabel-tabel berikut:

1. `menu_items` - Menyimpan informasi item menu
2. `orders` - Menyimpan informasi pesanan
3. `order_items` - Tabel junction antara pesanan dan item menu
4. `payments` - Menyimpan informasi pembayaran
5. `users` - Menyimpan informasi pengguna sistem kasir/admin

## Langkah-langkah

### 1. Definisikan Skema Database
- Buat definisi skema di `src/models/schema.ts`
- Gunakan tipe data yang sesuai dari Drizzle ORM
- Tambahkan relasi antar tabel

### 2. Konfigurasi Migrasi
- Buat file `drizzle.config.ts` untuk konfigurasi migrasi
- Tentukan output direktori untuk file-file migrasi

### 3. Jalankan Migrasi
- Generate file migrasi menggunakan Drizzle Kit
- Jalankan migrasi ke database

```
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

## Struktur Tabel

### menu_items
- id (SERIAL, PRIMARY KEY)
- name (VARCHAR(255), NOT NULL)
- description (TEXT)
- price (DECIMAL(10, 2), NOT NULL)
- category (VARCHAR(100))
- image_url (VARCHAR(255))
- is_available (BOOLEAN, DEFAULT TRUE)
- created_at (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### orders
- id (SERIAL, PRIMARY KEY)
- order_uid (UUID, DEFAULT gen_random_uuid())
- status (VARCHAR(50), NOT NULL)
- total_amount (DECIMAL(10, 2), NOT NULL)
- payment_method (VARCHAR(50), NOT NULL)
- table_number (VARCHAR(10))
- created_at (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### order_items
- id (SERIAL, PRIMARY KEY)
- order_id (INTEGER, REFERENCES orders(id) ON DELETE CASCADE)
- menu_item_id (INTEGER, REFERENCES menu_items(id))
- quantity (INTEGER, NOT NULL)
- price_at_order (DECIMAL(10, 2), NOT NULL)

### payments
- id (SERIAL, PRIMARY KEY)
- order_id (INTEGER, REFERENCES orders(id))
- midtrans_transaction_id (VARCHAR(255))
- status (VARCHAR(50), NOT NULL)
- amount (DECIMAL(10, 2), NOT NULL)
- payment_timestamp (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

### users
- id (SERIAL, PRIMARY KEY)
- username (VARCHAR(100), UNIQUE, NOT NULL)
- password_hash (VARCHAR(255), NOT NULL)
- role (VARCHAR(50), DEFAULT 'cashier')
- created_at (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

## Rencana Selanjutnya
Setelah menyelesaikan fase ini, kita akan lanjut ke:
- Fase 1.5: Implementasi Endpoint Publik Backend - Membuat endpoint yang tersedia untuk pelanggan

## Penjelasan
Pembuatan skema dan migrasi database adalah langkah penting dalam pengembangan backend. Dengan menggunakan Drizzle ORM, kita dapat mendefinisikan skema database dalam bentuk kode TypeScript, yang kemudian akan digunakan untuk menghasilkan file migrasi.

Skema database yang dibuat mengikuti spesifikasi teknis yang telah ditentukan, dengan tabel-tabel yang saling terkait sesuai kebutuhan aplikasi. Proses migrasi akan membuat struktur database fisik di PostgreSQL sesuai dengan definisi skema yang telah kita buat.