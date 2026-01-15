# Dokumentasi Sistem Admin - SDN 40 Pontianak Utara

## Overview
Sistem admin ini dibuat untuk mengelola berita dan kegiatan di SDN 40 Pontianak Utara. Sistem ini menggunakan MongoDB untuk menyimpan teks dan folder lokal untuk menyimpan gambar.

## Teknologi yang Digunakan
- Node.js
- Express
- MongoDB (MongoDB Atlas)
- Mongoose ODM
- BcryptJS (untuk enkripsi password)
- JSON Web Token (untuk otentikasi)
- Multer (untuk upload file)
- HTML/CSS/JavaScript (frontend)

## Instalasi

### 1. Install Dependencies
```bash
npm install
```

### 2. Inisialisasi Akun Admin
```bash
node init-admin.js
```
Langkah ini akan membuat akun admin default jika belum ada.

### 3. Jalankan Server
```bash
npm start
```
atau untuk development:
```bash
npm run dev
```

## Login Default
- **Username:** `admin`
- **Password:** `admin123`

Catatan: Setelah login pertama kali, segera ubah password default untuk alasan keamanan.

## Struktur File
```
SDN-40-Pontianak-Utara/
│
├── login.html              # Halaman login admin
├── dashboard.html          # Dashboard admin
├── index.html              # Halaman utama website (menampilkan berita & kegiatan dari API)
├── login.js               # Script untuk login
├── dashboard.js           # Script untuk dashboard
├── script.js              # Script untuk halaman utama (mengambil data dari API)
├── server.js              # Server backend utama
├── init-admin.js          # Script inisialisasi admin
├── .env                   # Konfigurasi environment
├── package.json           # Dependencies dan skrip
├── uploads/               # Folder untuk menyimpan gambar yang diupload
├── images/                # Folder untuk menyimpan gambar statis
└── ADMIN-DOKUMENTASI.md   # Dokumentasi ini
```

## API Endpoints

### Otentikasi
- `POST /login` - Login admin

### Endpoint Publik (tanpa otentikasi)
- `GET /api/public/news` - Mendapatkan 3 berita terbaru untuk ditampilkan di halaman utama
- `GET /api/public/activities` - Mendapatkan 4 kegiatan terbaru untuk ditampilkan di halaman utama

### Endpoint Admin (memerlukan otentikasi)
- `GET /api/news` - Mendapatkan semua berita
- `POST /api/news` - Menambahkan berita baru (mendukung upload maksimal 5 gambar, minimal 1 gambar)
- `PUT /api/news/:id` - Memperbarui berita (dapat menambahkan gambar baru)
- `DELETE /api/news/:id` - Menghapus berita

- `GET /api/activities` - Mendapatkan semua kegiatan
- `POST /api/activities` - Menambahkan kegiatan baru (mendukung upload maksimal 5 gambar, minimal 1 gambar)
- `PUT /api/activities/:id` - Memperbarui kegiatan (dapat menambahkan gambar baru)
- `DELETE /api/activities/:id` - Menghapus kegiatan

## Fitur Sistem
- Login/logout dengan otentikasi token
- Tambah, edit, dan hapus berita
- Upload hingga 5 gambar untuk setiap berita (disimpan di folder lokal), minimal 1 gambar
- Tambah, edit, dan hapus kegiatan
- Upload hingga 5 gambar untuk setiap kegiatan (disimpan di folder lokal), minimal 1 gambar
- Tampilan dashboard responsive
- Berita dan kegiatan yang ditambahkan akan otomatis tampil di halaman utama
- Preview gambar sebelum upload
- Validasi jumlah gambar (minimal 1, maksimal 5)
- Penanganan error upload

## Panduan Penggunaan Fitur Edit

### Edit Berita
1. Masuk ke halaman "Kelola Berita"
2. Klik tombol "Edit" pada berita yang ingin diubah
3. Form akan terisi otomatis dengan data berita yang dipilih
4. Lakukan perubahan pada judul, tanggal, atau konten berita sesuai kebutuhan
5. Jika ingin mengganti gambar, pilih gambar baru (minimal 1, maksimal 5)
6. Klik tombol "Update Berita" untuk menyimpan perubahan
7. Berita yang telah diupdate akan otomatis muncul di halaman utama

### Edit Kegiatan
1. Masuk ke halaman "Kelola Kegiatan"
2. Klik tombol "Edit" pada kegiatan yang ingin diubah
3. Form akan terisi otomatis dengan data kegiatan yang dipilih
4. Lakukan perubahan pada nama atau deskripsi kegiatan sesuai kebutuhan
5. Jika ingin mengganti gambar, pilih gambar baru (minimal 1, maksimal 5)
6. Klik tombol "Update Kegiatan" untuk menyimpan perubahan
7. Kegiatan yang telah diupdate akan otomatis muncul di halaman utama

## Database Schema

### Users
- `_id`: ObjectId
- `username`: String (unik)
- `password`: String (hash bcrypt)

### News
- `_id`: ObjectId
- `title`: String
- `date`: Date
- `content`: String
- `imageUrls`: Array[String] (maksimal 5 URL gambar, minimal 1)
- `createdAt`: Date
- `updatedAt`: Date

### Activities
- `_id`: ObjectId
- `title`: String
- `description`: String
- `imageUrls`: Array[String] (maksimal 5 URL gambar, minimal 1)
- `createdAt`: Date
- `updatedAt`: Date

## Konfigurasi .env
```
JWT_SECRET=this_is_a_strong_secret_key_for_jwt_tokens_that_should_be_at_least_32_characters_long
PORT=3000
MONGODB_URI=mongodb+srv://sd40utara_db_user:sdn40utara@dbwebsekolah.4eis5wu.mongodb.net/?appName=dbwebsekolah
```

## Catatan Penting
- Password admin disimpan dalam bentuk hash menggunakan bcrypt
- Gambar yang diupload disimpan di folder `uploads/` dan tidak disimpan di database
- Token otentikasi berlaku selama 24 jam
- Endpoint publik tidak memerlukan token otentikasi
- Berita dan kegiatan yang ditambahkan akan otomatis tampil di halaman utama
- Setiap entri berita/kegiatan HARUS memiliki minimal 1 gambar dan maksimal 5 gambar
- File gambar hanya boleh dalam format gambar (jpg, png, gif, dll)

## Keamanan
- Password di-hash sebelum disimpan
- Otentikasi menggunakan JWT token
- Middleware untuk memverifikasi token di setiap permintaan proteksi
- Validasi input di backend
- Pembatasan ukuran file upload (5MB per file)

## Penanganan Error
- Jika muncul error "MulterError: Unexpected field", periksa kembali nama field pada form dan sesuaikan dengan yang diharapkan oleh server
- Maksimum ukuran file per gambar adalah 5MB
- Maksimum jumlah gambar per entri adalah 5
- Hanya file gambar yang diperbolehkan untuk diupload

## Penggunaan
1. Akses halaman login di `http://localhost:3000/login.html`
2. Gunakan username dan password default: admin/admin123
3. Gunakan dashboard untuk mengelola berita dan kegiatan
4. Untuk menambahkan gambar, klik area upload dan pilih 1-5 gambar
5. Gambar yang diupload akan disimpan secara lokal di folder `uploads/`
6. Berita dan kegiatan yang ditambahkan akan otomatis tampil di halaman utama [index.html](file:///d:/New%20folder%20(6)/index.html)