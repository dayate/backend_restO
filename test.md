# Testing API dengan REST Client Extension di VS Code

Tutorial ini akan menjelaskan cara menggunakan ekstensi REST Client di Visual Studio Code untuk menguji API backend.

## Instalasi Ekstensi

1. Buka Visual Studio Code
2. Pergi ke tab Extensions (Ctrl+Shift+X)
3. Cari "REST Client" oleh Huachao Mao
4. Klik Install

## Cara Menggunakan

### 1. Membuat File .http
Buat file dengan ekstensi `.http` atau `.rest` (misalnya `api-test.rest`) di proyek Anda.

### 2. Menulis Request

Format dasar request:

```
POST http://localhost:3000/api/login HTTP/1.1
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

### 3. Menjalankan Request

- Klik "Send Request" di atas request yang ingin dijalankan
- Atau gunakan shortcut `Ctrl+Alt+R` (Windows/Linux) atau `Cmd+Alt+R` (Mac)

## Contoh Pengujian API Restoran

Berikut adalah beberapa contoh request untuk menguji API menu restoran:

### Login Admin
```
POST http://localhost:3000/api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

### Mendapatkan Semua Menu
```
GET http://localhost:3000/api/menu HTTP/1.1
Authorization: Bearer {{token}}
```

### Menambahkan Menu Baru
```
POST http://localhost:3000/api/menu HTTP/1.1
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "name": "Nasi Goreng",
  "price": 25000,
  "category": "Makanan"
}
```

### Memperbarui Menu
```
PUT http://localhost:3000/api/menu/1 HTTP/1.1
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "name": "Nasi Goreng Spesial",
  "price": 30000,
  "category": "Makanan"
}
```

### Menghapus Menu
```
DELETE http://localhost:3000/api/menu/1 HTTP/1.1
Authorization: Bearer {{token}}
```

## Menggunakan Variabel

REST Client memungkinkan Anda menggunakan variabel untuk menyederhanakan pengujian:

### Mendefinisikan Variabel
```
@base_url = http://localhost:3000
@token = {{login.response.body.token}}
```

### Menggunakan Variabel dalam Request
```
GET {{base_url}}/api/menu HTTP/1.1
Authorization: Bearer {{token}}
```

### Variabel Lingkungan
Anda juga bisa membuat file `environments.json` untuk menyimpan variabel berbeda untuk berbagai lingkungan:

```json
{
  "development": {
    "base_url": "http://localhost:3000"
  },
  "testing": {
    "base_url": "https://api.testing.com"
  }
}
```

## Menyimpan Response

Untuk menyimpan response ke file, gunakan sintaks berikut:

```
> {%
    // Menyimpan response ke file
    client.global.set("token", response.body.token);
    // Simpan response ke file
    client.writeFile("response.json", response.body);
%}
```

## Tips dan Trik

1. **Gunakan Komentar**: Gunakan `#` untuk menambahkan komentar dalam file .http
2. **Format JSON**: Gunakan fitur format JSON dari VS Code untuk memformat body request
3. **Integrasi dengan Git**: Tambahkan file .rest ke .gitignore jika berisi data sensitif
4. **Request Chain**: Gunakan response dari satu request sebagai input untuk request berikutnya

## Contoh File Lengkap

Berikut adalah contoh lengkap file `api-test.rest`:

```
# File ini berisi kumpulan request untuk menguji API Restoran

# Variabel Umum
@base_url = http://localhost:3000

### Login Admin
POST {{base_url}}/api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}

> {% 
  client.global.set("auth_token", response.body.token);
%}

### Mendapatkan Semua Menu
GET {{base_url}}/api/menu HTTP/1.1
Authorization: Bearer {{auth_token}}

### Menambahkan Menu Baru
POST {{base_url}}/api/menu HTTP/1.1
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "name": "Soto Ayam",
  "price": 18000,
  "category": "Makanan"
}

### Mendapatkan Menu Berdasarkan Kategori
GET {{base_url}}/api/menu?category=Makanan HTTP/1.1
Authorization: Bearer {{auth_token}}

### Memperbarui Harga Menu
PUT {{base_url}}/api/menu/1 HTTP/1.1
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "name": "Soto Ayam Spesial",
  "price": 20000,
  "category": "Makanan"
}

### Menghapus Menu
DELETE {{base_url}}/api/menu/1 HTTP/1.1
Authorization: Bearer {{auth_token}}
```

## Kesimpulan

Ekstensi REST Client di VS Code menyediakan cara yang mudah dan efisien untuk menguji API tanpa harus menggunakan alat pihak ketiga seperti Postman. Dengan fitur variabel dan chaining request, Anda dapat membuat serangkaian pengujian yang kompleks untuk API Anda.