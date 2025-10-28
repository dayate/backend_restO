# Perubahan dari Midtrans ke Duitku

## Latar Belakang
Dokumen ini menjelaskan perubahan arsitektur sistem pembayaran dari Midtrans ke Duitku dalam aplikasi RestoMenu. Perubahan ini dilakukan untuk memenuhi kebutuhan bisnis, fitur layanan, biaya, atau pertimbangan teknis lainnya.

## Alasan Perubahan
- Kebutuhan untuk menggunakan layanan pembayaran lokal yang lebih sesuai
- Pertimbangan biaya atau fitur yang ditawarkan Duitku
- Kemudahan integrasi atau dukungan teknis
- Penggunaan sandbox Duitku dalam lingkungan development
- Dokumentasi resmi Duitku tersedia di: https://docs.duitku.com/

## Dampak Perubahan
- Endpoint pembayaran akan menggunakan API Duitku
- Endpoint webhook akan menerima notifikasi dari Duitku
- File konfigurasi pembayaran akan disesuaikan untuk Duitku
- Endpoint `/api/v1/payments/qris` akan diintegrasikan dengan Duitku
- Endpoint `/api/v1/webhooks/midtrans` akan diganti dengan `/api/v1/webhooks/duitku`

## File yang Terdampak
- `docs/fase-1.6-implementasi-endpoint-pembayaran-backend.md` (arsip)
- `docs/fase-1.6-implementasi-endpoint-pembayaran-duitku.md` (dokumentasi baru)
- File-file implementasi pembayaran yang akan dibuat kemudian:
  - `src/utils/duitku.ts`
  - `src/routes/payments.ts`
  - `src/routes/webhooks.ts`

## Lingkungan Development
- Duitku sandbox akan digunakan untuk pengembangan dan testing
- Environment variables akan disesuaikan untuk kredensial Duitku sandbox
- Proses development akan menggunakan akun sandbox Duitku

## Checklist Persiapan
- [ ] Kredensial Duitku sandbox tersedia
- [ ] Dokumentasi API Duitku dipelajari
- [ ] Endpoint pembayaran Duitku direncanakan
- [ ] Webhook handler untuk Duitku direncanakan
- [ ] Integrasi dengan sistem pesanan direncanakan

## Timeline
- Perubahan direncanakan dalam Fase 1.6
- Implementasi akan mengikuti dokumentasi baru
- Testing akan dilakukan dengan sandbox Duitku