# Fase 1.6: Implementasi Endpoint Pembayaran Backend

## Ringkasan
Pada fase ini, kita akan mengimplementasikan endpoint-endpoint yang berhubungan dengan proses pembayaran, termasuk pembuatan transaksi QRIS melalui Midtrans dan endpoint webhook untuk menerima notifikasi status pembayaran.

## Tujuan
- Membuat endpoint untuk pembuatan transaksi QRIS melalui Midtrans
- Mengimplementasikan endpoint webhook untuk menerima notifikasi dari Midtrans
- Menghubungkan proses pembayaran dengan sistem pesanan

## Endpoint yang Dibuat

### 1. POST /api/v1/payments/qris
- Deskripsi: Membuat permintaan pembayaran QRIS ke Midtrans
- Request Body: `{order_id: number, amount: number, customer_details: object}`
- Respons: `{transaction_token: string, qris_url: string, order_uid: string}`

### 2. POST /api/v1/webhooks/midtrans
- Deskripsi: Endpoint untuk menerima notifikasi status pembayaran dari Midtrans
- Request Body: Webhook payload dari Midtrans
- Respons: Status penerimaan webhook

## Integrasi Midtrans
- Gunakan Midtrans Sandbox untuk pengembangan
- Konfigurasi environment variables untuk Midtrans
- Implementasi pembuatan QRIS dengan Snap API

## Proses Pembayaran
1. Pelanggan memilih metode pembayaran QRIS
2. Backend membuat transaksi di Midtrans
3. Midtrans mengembalikan QR code
4. Pelanggan membayar melalui e-wallet
5. Midtrans mengirim webhook ke backend
6. Backend memperbarui status pesanan

## Struktur File
```
backend/
├── src/
│   ├── routes/
│   │   ├── payments.ts
│   │   └── webhooks.ts
│   ├── utils/
│   │   └── midtrans.ts
│   └── middleware/
├── .env
└── server.ts
```

## Security & Validation
- Validasi signature key dari Midtrans untuk memastikan webhook sah
- Pastikan endpoint webhook tidak dapat diakses secara langsung

## Rencana Selanjutnya
Setelah menyelesaikan fase ini, kita akan lanjut ke:
- Fase 1.7: Implementasi Endpoint Admin Backend - Membuat endpoint untuk sistem admin/kasir

## Penjelasan
Endpoint pembayaran merupakan komponen kritis dalam sistem pemesanan makanan. Pada fase ini, kita mengimplementasikan integrasi dengan Midtrans untuk pembayaran QRIS, termasuk pembuatan transaksi dan penanganan webhook untuk menerima notifikasi status pembayaran.

Selain endpoint pembayaran QRIS, kita juga memastikan bahwa sistem dapat menangani pembayaran tunai yang diproses di kasir, yang akan terintegrasi dengan sistem manajemen pesanan. Endpoint webhook sangat penting untuk memastikan bahwa status pembayaran diperbarui secara otomatis ketika pelanggan melakukan pembayaran melalui e-wallet.