# Fase 1.5: Implementasi Endpoint Publik Backend

## Ringkasan
Pada fase ini, kita akan mengimplementasikan endpoint-endpoint publik yang dapat diakses oleh pelanggan. Endpoint ini mencakup tampilan menu, validasi lokasi, pembuatan pesanan, dan pengecekan status pesanan.

## Tujuan
- Membuat endpoint untuk menampilkan menu
- Mengimplementasikan validasi lokasi pelanggan
- Membuat endpoint untuk pembuatan pesanan
- Mengimplementasikan endpoint untuk mengecek status pesanan

## Endpoint yang Dibuat

### 1. GET /api/v1/menu
- Deskripsi: Mengambil semua item menu yang tersedia
- Respons: Daftar item menu dengan nama, deskripsi, harga, kategori, dan gambar

### 2. POST /api/v1/location-check
- Deskripsi: Menerima koordinat {lat, long} dari pelanggan dan mengembalikan status validasi lokasi
- Request Body: `{lat: number, long: number}`
- Respons: `{isValid: boolean, message: string}`

### 3. POST /api/v1/orders
- Deskripsi: Membuat pesanan baru dari pelanggan
- Request Body: `{items: [{menu_item_id: number, quantity: number}], payment_method: 'qris'|'cash', table_number?: string}`
- Respons: Informasi pesanan yang baru dibuat termasuk order_uid

### 4. GET /api/v1/orders/:order_uid
- Deskripsi: Mengambil status pesanan tertentu untuk pelanggan
- Parameter: order_uid
- Respons: Status pesanan dan informasi terkait

## Struktur File
```
backend/
├── src/
│   ├── routes/
│   │   ├── public/
│   │   │   ├── menu.ts
│   │   │   ├── location.ts
│   │   │   └── orders.ts
│   │   └── index.ts
│   ├── models/
│   │   └── schema.ts
│   ├── middleware/
│   └── utils/
├── .env
└── server.ts
```

## Validasi Lokasi
- Endpoint location-check akan memverifikasi apakah koordinat pelanggan berada dalam radius tertentu dari restoran
- Radius default: 50 meter
- Gunakan rumus haversine untuk menghitung jarak antara dua titik

## Rencana Selanjutnya
Setelah menyelesaikan fase ini, kita akan lanjut ke:
- Fase 1.6: Implementasi Endpoint Pembayaran Backend - Membuat endpoint untuk pembayaran QRIS dan webhook Midtrans

## Penjelasan
Endpoint publik merupakan bagian penting dari backend yang berinteraksi langsung dengan frontend pelanggan. Pada fase ini, kita mengimplementasikan endpoint untuk menampilkan menu, memvalidasi lokasi pengguna, membuat pesanan, dan mengecek status pesanan.

Implementasi endpoint dilakukan dengan Hono framework, dan menggunakan Drizzle ORM untuk berinteraksi dengan database. Untuk validasi lokasi, kita akan menggunakan perhitungan jarak antara koordinat pelanggan dan lokasi restoran menggunakan rumus haversine, memastikan aplikasi hanya dapat diakses oleh pelanggan yang berada dalam radius tertentu dari restoran.