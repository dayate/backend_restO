# Fase 1.7: Implementasi Endpoint Admin Backend

## Ringkasan
Pada fase ini, kita akan mengimplementasikan endpoint-endpoint administrasi yang memerlukan otentikasi dan otorisasi. Endpoint ini digunakan oleh sistem kasir dan admin untuk mengelola menu, pesanan, dan pembayaran tunai.

## Tujuan
- Membuat endpoint untuk manajemen menu (CRUD)
- Mengimplementasikan endpoint untuk dashboard pesanan
- Membuat endpoint untuk scan dan konfirmasi pembayaran tunai
- Mengimplementasikan endpoint untuk manajemen status pesanan
- Membuat endpoint login untuk otentikasi admin

## Endpoint yang Dibuat

### 1. Otentikasi Admin
- POST /api/v1/admin/login
  - Request Body: `{username: string, password: string}`
  - Respons: `{token: string, user: object}`

### 2. Manajemen Menu
- GET /api/v1/admin/menu
  - Respons: Daftar semua item menu
- POST /api/v1/admin/menu
  - Request Body: `{name: string, description: string, price: number, category: string, image_url: string, is_available: boolean}`
  - Respons: Item menu yang baru dibuat
- PUT /api/v1/admin/menu/:id
  - Request Body: Data yang ingin diupdate
  - Respons: Item menu yang telah diupdate
- DELETE /api/v1/admin/menu/:id
  - Respons: Status penghapusan

### 3. Dashboard Pesanan
- GET /api/v1/admin/orders
  - Respons: Daftar semua pesanan aktif dengan status

### 4. Scan dan Konfirmasi Pembayaran Tunai
- POST /api/v1/admin/orders/scan
  - Request Body: `{order_uid: string}`
  - Respons: Detail pesanan yang akan dibayar tunai
- PUT /api/v1/admin/orders/:id/confirm-payment
  - Respons: Status konfirmasi pembayaran

### 5. Manajemen Status Pesanan
- PUT /api/v1/admin/orders/:id/status
  - Request Body: `{status: string}`
  - Respons: Status update pesanan

## Middleware Otentikasi
- Implementasi middleware untuk memvalidasi token JWT
- Endpoint admin hanya bisa diakses dengan token valid

## Struktur File
```
backend/
├── src/
│   ├── routes/
│   │   └── admin/
│   │       ├── auth.ts
│   │       ├── menu.ts
│   │       ├── orders.ts
│   │       └── index.ts
│   ├── middleware/
│   │   └── auth.ts
│   ├── utils/
│   │   └── auth.ts
│   └── models/
├── .env
└── server.ts
```

## Security & Validation
- Gunakan JWT untuk otentikasi
- Hash password sebelum disimpan ke database
- Validasi input untuk mencegah SQL injection dan serangan lainnya

## Rencana Selanjutnya
Setelah menyelesaikan fase ini, kita akan lanjut ke:
- Fase 1.8: Implementasi WebSocket dan Real-time Notification - Menambahkan fungsionalitas real-time untuk notifikasi status pesanan

## Penjelasan
Endpoint admin sangat penting dalam sistem pemesanan makanan, karena digunakan oleh kasir dan admin untuk mengelola operasional. Fase ini mencakup pembuatan endpoint untuk manajemen menu, dashboard pesanan, dan proses pembayaran tunai yang harus dipindai di kasir.

Selain itu, kita juga akan mengimplementasikan sistem otentikasi menggunakan JWT untuk memastikan bahwa endpoint admin hanya dapat diakses oleh pengguna yang sah. Sistem ini akan memungkinkan pembuatan dan manajemen pengguna dengan peran berbeda (kasir dan admin) sesuai dengan spesifikasi teknis.