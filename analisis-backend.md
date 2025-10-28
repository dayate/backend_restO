# Analisis Backend RestoMenu

Laporan ini menyajikan hasil analisis backend aplikasi RestoMenu, mencakup fitur-fitur yang telah diimplementasikan, yang masih perlu dikerjakan, dan bagian-bagian yang perlu perbaikan.

## Fitur-fitur yang Telah Diimplementasikan

### 1. Struktur dan Konfigurasi Backend
- Struktur direktori backend telah dibuat dan diorganisasi dengan baik
- Dependencies utama telah diinstal (Hono, Drizzle ORM, PostgreSQL driver, bcrypt, jsonwebtoken, ws)
- Konfigurasi database PostgreSQL dengan Drizzle ORM telah dilakukan
- File konfigurasi (`drizzle.config.ts`) dan environment variables telah disiapkan
- Skema database telah didefinisikan dan migrasi pertama telah dijalankan

### 2. Endpoint Publik
- **GET /api/v1/menu** - Mengambil semua item menu yang tersedia
- **POST /api/v1/location-check** - Validasi lokasi pelanggan
- **POST /api/v1/orders** - Membuat pesanan baru dari pelanggan
- **GET /api/v1/orders/:order_uid** - Mengambil status pesanan tertentu untuk pelanggan

### 3. Endpoint Admin
- **POST /api/v1/admin/login** - Login untuk admin
- **GET, POST, PUT, DELETE /api/v1/admin/menu** - CRUD untuk manajemen menu
- **GET, PUT /api/v1/admin/orders** - Dashboard pesanan dan update status
- **POST /api/v1/admin/orders/scan** - Mendapatkan detail pesanan berdasarkan order UID
- **PUT /api/v1/admin/orders/:id/confirm-payment** - Konfirmasi pembayaran tunai
- **PUT /api/v1/admin/orders/:id/status** - Update status pesanan

### 4. Sistem Otentikasi
- Middleware otentikasi JWT telah diimplementasikan
- Hash password menggunakan bcrypt
- Endpoint login untuk admin telah dibuat

### 5. Database
- Skema database telah didefinisikan dan dimigrasikan
- Tabel: menu_items, orders, order_items, payments, users
- Relasi antar tabel telah dibuat

### 6. Sistem Logging
- Library logging pino telah diinstal dan dikonfigurasi
- Middleware logging untuk mencatat request dan response telah dibuat
- Logging telah diimplementasikan di semua endpoint penting
- File log disimpan ke direktori logs (app.log dan error.log)
- Error handler global telah diimplementasikan

### 6. File Setup
- create-admin.ts - Skrip untuk membuat pengguna admin awal
- create-menu.ts - Skrip untuk membuat daftar menu contoh
- create-orders.ts - Skrip untuk membuat data pesanan contoh
- setup-all.ts - Skrip kombinasi untuk menjalankan semua skrip setup awal
- setup-db.ts - Skrip setup database

## Fitur-fitur yang Masih Perlu Dikerjakan

### 1. WebSocket dan Real-time Notification (Fase 1.8)
- Implementasi WebSocket server menggunakan `hono/ws`
- Mekanisme join room berdasarkan order UID
- Penanganan koneksi, pesan, dan penutupan koneksi
- Event WebSocket:
  - `order_status_update`: Kirim update status pesanan ke pelanggan
  - `new_order`: Kirim notifikasi pesanan baru ke dashboard kasir
  - `payment_success`: Kirim notifikasi pembayaran sukses
- Integrasi WebSocket dengan endpoint pembuatan pesanan
- Integrasi WebSocket dengan endpoint perubahan status pesanan
- Integrasi WebSocket dengan endpoint konfirmasi pembayaran

### 2. Endpoint Pembayaran Duitku (Fase 1.6)
- Endpoint POST /api/v1/payments/qris untuk pembuatan transaksi QRIS melalui Duitku (menggantikan Midtrans)
- Endpoint POST /api/v1/webhooks/duitku untuk menerima notifikasi dari Duitku
- File `src/utils/duitku.ts` untuk konfigurasi integrasi Duitku
- Implementasi sandbox Duitku untuk pengembangan
- Dokumentasi resmi Duitku: https://docs.duitku.com/

## Bagian-bagian yang Perlu Perbaikan

### 1. Ketidaksesuaian Dokumentasi dan Implementasi
- Dokumentasi menyatakan bahwa Fase 1.8 (Implementasi WebSocket dan Real-time Notification) telah selesai, tetapi file-file implementasi WebSocket tidak ditemukan dalam struktur kode.
- Dokumentasi menyatakan endpoint pembayaran dan webhook Midtrans telah diimplementasikan, namun file-file tersebut tidak ditemukan.

### 2. Pengelolaan Koneksi Database
- Banyak endpoint membuat koneksi database baru menggunakan fungsi `createDBConnection` yang mengulang konfigurasi koneksi.
- Disarankan untuk menggunakan single connection instance dari `src/config/database.ts` yang sudah disediakan.

### 3. Endpoint Konfirmasi Pembayaran Tunai
- Dalam file `src/routes/admin/orders.ts`, endpoint PUT `/confirm-payment` hanya mengubah status ke `'menunggu_konfirmasi'`, yang bukan merupakan status akhir untuk pembayaran tunai.
- Harusnya mengubah status ke `'dikonfirmasi'` atau `'sedang_dipersiapkan'` untuk pembayaran tunai yang dikonfirmasi.

### 4. Kekurangan Validasi Input
- Beberapa endpoint mungkin memerlukan validasi input tambahan untuk mencegah serangan dan memastikan data yang masuk valid.

### 5. Struktur File Auth
- Terdapat file `src/lib/lucia.ts` yang menyiapkan Lucia Auth, tetapi implementasi otentikasi masih menggunakan JWT sederhana.
- File `src/routes/admin/register.ts` yang menggunakan Lucia, tetapi tidak digunakan di routing utama.
- Harus diputuskan pendekatan otentikasi yang akan digunakan (JWT atau Lucia).

### 6. Endpoint Register Admin
- Endpoint untuk mendaftarkan admin baru (`/api/v1/admin/register`) ada di file `src/routes/admin/register.ts` tapi tidak diintegrasikan ke dalam routing utama.

### 7. Migrasi Database
- Ada dua file migrasi `0001_add-session-table.sql` dan `0001_add-sessions-table.sql` yang menunjukkan adanya perubahan struktur tabel session, menunjukkan mungkin ada inconsistency dalam pengembangan.

## Rekomendasi Tindak Lanjut

### Prioritas Tinggi
1. Implementasi WebSocket dan Real-time Notification sesuai dokumentasi Fase 1.8
2. Implementasi endpoint pembayaran dan webhook Midtrans sesuai dokumentasi Fase 1.6
3. Perbaikan endpoint konfirmasi pembayaran tunai agar mengganti status ke `'dikonfirmasi'` atau `'sedang_dipersiapkan'`
4. Memutuskan pendekatan otentikasi (JWT atau Lucia) dan menyatukan implementasi

### Prioritas Sedang
1. Menyederhanakan pengelolaan koneksi database dengan menggunakan single connection instance
2. Menambahkan validasi input tambahan
3. Mengintegrasikan endpoint register admin ke dalam routing utama

### Prioritas Rendah
1. Meninjau dan membersihkan file-file migrasi database yang duplicate atau tidak perlu