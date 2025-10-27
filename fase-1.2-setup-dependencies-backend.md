# Fase 1.2: Setup Dependencies Backend

## Ringkasan
Pada fase ini, kita akan menginstal dan mengkonfigurasi dependencies yang diperlukan untuk backend aplikasi. Ini termasuk framework Hono, ORM Drizzle, driver database PostgreSQL, library Midtrans untuk pembayaran, dan dependensi pendukung lainnya.

## Tujuan
- Menginstal semua dependencies yang diperlukan
- Mengkonfigurasi dependencies untuk bekerja dengan baik bersama
- Menyiapkan environment untuk pengembangan lebih lanjut

## Dependencies Utama
- **Hono**: Framework web yang cepat dan ringan untuk runtime JavaScript
- **Drizzle ORM**: Object Relational Mapping untuk interaksi database yang type-safe
- **PostgreSQL Driver**: Driver untuk koneksi ke database PostgreSQL
- **Midtrans**: Library untuk integrasi pembayaran QRIS
- **WebSocket**: Library untuk komunikasi real-time
- **bcrypt**: Library untuk hashing password
- **jsonwebtoken**: Library untuk manajemen autentikasi JWT

## Langkah-langkah

### 1. Inisialisasi package.json
```bash
bun init
```

### 2. Instal Dependencies Utama
```bash
bun add hono drizzle-orm pg bcrypt jsonwebtoken @types/bcrypt @types/jsonwebtoken
```

### 3. Instal Development Dependencies
```bash
bun add -D drizzle-kit tsx typescript @types/node
```

### 4. Instal Additional Dependencies
```bash
bun add ws @types/ws
```

## Konfigurasi
- Buat file `tsconfig.json` untuk konfigurasi TypeScript
- Konfigurasi Drizzle ORM untuk PostgreSQL
- Siapkan konfigurasi Midtrans Sandbox

## Rencana Selanjutnya
Setelah menyelesaikan fase ini, kita akan lanjut ke:
- Fase 1.3: Konfigurasi Database Backend - Mengatur koneksi database dan konfigurasi Drizzle ORM

## Penjelasan
Setup dependencies merupakan langkah krusial dalam pengembangan backend. Dependencies yang dipilih disesuaikan dengan spesifikasi teknis aplikasi, yaitu menggunakan Hono sebagai framework web, Drizzle ORM untuk interaksi database, dan PostgreSQL sebagai sistem database utama.

Kita juga menginstal beberapa development dependencies untuk mendukung proses development, seperti Drizzle Kit untuk manajemen migrasi, serta type definitions untuk TypeScript. Selain itu, kita menyiapkan library untuk WebSocket, autentikasi, dan integrasi pembayaran Midtrans sesuai dengan kebutuhan aplikasi.