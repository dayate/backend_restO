# Fase 1.6: Implementasi Endpoint Pembayaran Backend (Duitku)

## Ringkasan
Pada fase ini, kita akan mengimplementasikan endpoint-endpoint yang berhubungan dengan proses pembayaran menggunakan layanan Duitku, menggantikan Midtrans sebelumnya. Ini mencakup pembuatan transaksi QRIS melalui Duitku dan endpoint webhook untuk menerima notifikasi status pembayaran.

## Tujuan
- Membuat endpoint untuk pembuatan transaksi QRIS melalui Duitku
- Mengimplementasikan endpoint webhook untuk menerima notifikasi dari Duitku
- Menghubungkan proses pembayaran dengan sistem pesanan
- Menggunakan sandbox Duitku untuk pengembangan

## Endpoint yang Dibuat

### 1. POST /api/v1/payments/qris
- Deskripsi: Membuat permintaan pembayaran QRIS ke Duitku
- Request Body: `{order_id: number, amount: number, customer_details: object}`
- Respons: `{transaction_token: string, qris_url: string, order_uid: string}`

### 2. POST /api/v1/webhooks/duitku
- Deskripsi: Endpoint untuk menerima notifikasi status pembayaran dari Duitku
- Request Body: Webhook payload dari Duitku
- Respons: Status penerimaan webhook

## Integrasi Duitku
- Gunakan Duitku Sandbox untuk pengembangan
- Konfigurasi environment variables untuk Duitku
- Implementasi pembuatan QRIS dengan API Duitku
- Lihat dokumentasi resmi: https://docs.duitku.com/

## Proses Pembayaran
1. Pelanggan memilih metode pembayaran QRIS
2. Backend membuat transaksi di Duitku
3. Duitku mengembalikan QR code
4. Pelanggan membayar melalui e-wallet
5. Duitku mengirim webhook ke backend
6. Backend memperbarui status pesanan

## Struktur File
```
backend/
├── src/
│   ├── routes/
│   │   ├── payments.ts
│   │   └── webhooks.ts
│   ├── utils/
│   │   └── duitku.ts
│   └── middleware/
├── .env
└── server.ts
```

## Security & Validation
- Validasi signature key dari Duitku untuk memastikan webhook sah
- Pastikan endpoint webhook tidak dapat diakses secara langsung

## Rencana Selanjutnya
Setelah menyelesaikan fase ini, kita akan lanjut ke:
- Fase 1.7: Implementasi Endpoint Admin Backend - Membuat endpoint untuk sistem admin/kasir

## Penjelasan
Endpoint pembayaran merupakan komponen kritis dalam sistem pemesanan makanan. Pada fase ini, kita mengimplementasikan integrasi dengan Duitku untuk pembayaran QRIS, termasuk pembuatan transaksi dan penanganan webhook untuk menerima notifikasi status pembayaran.

Selain endpoint pembayaran QRIS, kita juga memastikan bahwa sistem dapat menangani pembayaran tunai yang diproses di kasir, yang akan terintegrasi dengan sistem manajemen pesanan. Endpoint webhook sangat penting untuk memastikan bahwa status pembayaran diperbarui secara otomatis ketika pelanggan melakukan pembayaran melalui e-wallet.