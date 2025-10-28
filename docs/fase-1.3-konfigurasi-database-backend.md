# Fase 1.3: Konfigurasi Database Backend

## Ringkasan
Pada fase ini, kita akan mengkonfigurasi koneksi database PostgreSQL menggunakan Drizzle ORM. Ini mencakup pembuatan file konfigurasi database, definisi schema, dan persiapan untuk migrasi database.

## Tujuan
- Mengkonfigurasi koneksi ke database PostgreSQL
- Mengatur Drizzle ORM untuk manajemen database
- Menyiapkan konfigurasi untuk migrasi database

## Langkah-langkah

### 1. Buat File Konfigurasi Database
- Buat file `src/config/database.ts` untuk menyimpan konfigurasi koneksi database
- Definisikan environment variables untuk koneksi database

### 2. Konfigurasi Drizzle ORM
- Buat file `drizzle.config.ts` untuk konfigurasi Drizzle Kit
- Definisikan schema database dan target migrasi

### 3. Buat Environment Variables
- Buat file `.env` untuk menyimpan konfigurasi sensitif
- Tambahkan konfigurasi database ke `.env.example`

### 4. Buat Schema Database
- Buat file `src/models/schema.ts` untuk mendefinisikan struktur tabel
- Ikuti skema database dari tech-spec.md

## Struktur File
```
backend/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── models/
│   │   └── schema.ts
│   └── utils/
├── .env
├── .env.example
├── drizzle.config.ts
└── package.json
```

## Environment Variables
```
DATABASE_URL=postgresql://username:password@localhost:5432/restaurant_db
DB_HOST=localhost
DB_PORT=5432
DB_USER=username
DB_PASSWORD=password
DB_NAME=restaurant_db
```

## Rencana Selanjutnya
Setelah menyelesaikan fase ini, kita akan lanjut ke:
- Fase 1.4: Pembuatan Skema dan Migrasi Database - Membuat dan menjalankan migrasi database pertama

## Penjelasan
Konfigurasi database merupakan langkah penting dalam pengembangan backend. Dengan menggunakan Drizzle ORM, kita mendapatkan keamanan tipe data dan kemudahan dalam manajemen database. Pada fase ini, kita menyiapkan dasar untuk koneksi database dan struktur tabel yang akan digunakan dalam aplikasi.

File konfigurasi database akan mengelola koneksi ke PostgreSQL, sementara file schema akan mendefinisikan struktur tabel sesuai dengan spesifikasi teknis. File `.env` digunakan untuk menyimpan informasi sensitif seperti kredensial database, yang tidak akan di-commit ke repository.