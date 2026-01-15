# Website SD Negeri 40 Kecamatan Pontianak Utara

Website ini dibuat untuk menyediakan informasi tentang SD Negeri 40 Kecamatan Pontianak Utara, termasuk berita, kegiatan sekolah, dan informasi penting lainnya.

## Fitur

- Tampilan responsif untuk berbagai perangkat
- Halaman tentang sekolah, fasilitas, dan informasi kontak
- Halaman berita untuk menampilkan informasi terbaru
- Halaman kegiatan untuk galeri kegiatan sekolah
- Sistem administrasi untuk mengelola berita dan kegiatan
- Upload gambar untuk berita dan kegiatan (1-5 gambar per entri)

## Teknologi yang Digunakan

- HTML5, CSS3, JavaScript
- Node.js untuk backend
- MongoDB untuk database
- Express.js untuk framework web
- Multer untuk upload file
- JWT untuk otentikasi

## Instalasi Lokal

1. Clone repository ini
2. Install Node.js dan npm
3. Jalankan `npm install` untuk menginstal dependensi
4. Buat file `.env` dan tambahkan:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```
5. Jalankan `node server.js` untuk memulai server
6. Akses `http://localhost:3000` di browser Anda

## Deployment

Untuk informasi lengkap tentang cara meng-deploy ke Cloudflare dan platform hosting lainnya, lihat file [DEPLOYMENT-CLOUDFLARE.md](file:///d:/New%20folder%20(6)/DEPLOYMENT-CLOUDFLARE.md).

## Penggunaan Admin

1. Akses halaman login admin
2. Gunakan username dan password untuk login
3. Tambahkan, edit, atau hapus berita dan kegiatan
4. Upload 1-5 gambar per entri

## Kontribusi

Silakan fork repository ini dan buat pull request untuk kontribusi.

## Lisensi

Proyek ini dilisensikan di bawah MIT License.