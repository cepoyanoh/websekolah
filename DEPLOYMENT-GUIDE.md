# Panduan Deployment Aplikasi Web SD Negeri 40 Kecamatan Pontianak Utara

## Ringkasan
Aplikasi ini terdiri dari:
- Frontend: HTML, CSS, JavaScript statis
- Backend: Server Node.js dengan API untuk manajemen berita dan kegiatan
- Database: MongoDB untuk menyimpan data berita, kegiatan, dan pengguna admin

## Metode Deployment

### 1. Deployment Manual (Server Tradisional)

#### Persyaratan Sistem:
- Node.js versi 16.x atau lebih baru
- MongoDB (lokal atau hosted seperti MongoDB Atlas)
- npm (Node Package Manager)

#### Langkah-langkah:

1. **Upload file ke server**
   ```bash
   scp -r /lokasi/proyek user@serveranda.com:/path/to/web/directory
   ```

2. **SSH ke server dan instal dependensi**
   ```bash
   ssh user@serveranda.com
   cd /path/to/web/directory
   npm install
   ```

3. **Buat file konfigurasi .env**
   ```bash
   cp .env.example .env
   nano .env
   ```
   
   Isi dengan konfigurasi sesuai lingkungan produksi:
   ```
   PORT=3000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nama_database
   JWT_SECRET=kata_rahasia_yang_kuat_dan_acak
   JWT_EXPIRES_IN=24h
   ```

4. **Jalankan aplikasi**
   - Untuk testing: `npm run dev`
   - Untuk production: `npm start` atau gunakan PM2
   
   Menggunakan PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "sekolah-app"
   pm2 startup
   pm2 save
   ```

5. **Setup reverse proxy (jika menggunakan Nginx)**
   ```nginx
   server {
       listen 80;
       server_name domain-anda.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### 2. Deployment dengan Docker

#### Persyaratan:
- Docker Engine
- Docker Compose

#### Langkah-langkah:

1. **Upload file ke server**
   ```bash
   scp -r /lokasi/proyek user@serveranda.com:/path/to/web/directory
   ```

2. **SSH ke server dan buat direktori uploads**
   ```bash
   ssh user@serveranda.com
   cd /path/to/web/directory
   mkdir uploads
   chmod 755 uploads
   ```

3. **Jalankan aplikasi dengan Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Verifikasi aplikasi berjalan**
   ```bash
   docker-compose ps
   ```

### 3. Deployment ke Platform Cloud (Railway, Render, Heroku, dll.)

#### Railway.app:
1. Buat akun di railway.app
2. Hubungkan ke repository GitHub Anda
3. Tambahkan variabel lingkungan:
   - MONGODB_URI
   - JWT_SECRET
4. Deploy otomatis saat push ke GitHub

#### Render.com:
1. Buat akun di render.com
2. Buat Web Service baru
3. Hubungkan ke repository GitHub
4. Atur environment variables
5. Render akan otomatis build dan deploy

## Konfigurasi Pasca-Deployment

### 1. Setup Akun Admin
Setelah deployment selesai, Anda perlu membuat akun admin pertama kali:
```bash
node init-admin.js
```
Ikuti instruksi untuk membuat akun admin.

### 2. Konfigurasi SSL (disarankan untuk produksi)
Gunakan Let's Encrypt untuk sertifikat SSL gratis:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d domain-anda.com
```

### 3. Backup Rutin
Buat skrip backup rutin untuk:
- Database MongoDB
- Folder uploads (gambar berita dan kegiatan)
- File konfigurasi penting

Contoh backup MongoDB:
```bash
mongodump --uri="mongodb+srv://..." --out=/backup/path/$(date +%Y%m%d)
```

## Monitoring dan Logging

### Log Aplikasi
Log aplikasi dapat dilihat dengan:
```bash
# Jika menggunakan PM2
pm2 logs sekolah-app

# Jika menggunakan Docker
docker-compose logs -f app
```

### Monitoring Kinerja
- Gunakan PM2 untuk monitoring kinerja aplikasi
- Monitor penggunaan memory dan CPU
- Cek response time endpoint penting

## Troubleshooting Umum

### Aplikasi Tidak Bisa Diakses
- Pastikan port yang digunakan tidak diblokir firewall
- Cek apakah service berjalan: `systemctl status nama-service`
- Verifikasi konfigurasi reverse proxy

### Database Tidak Bisa Dihubungi
- Pastikan URI MongoDB benar dan bisa diakses
- Cek apakah MongoDB sedang berjalan
- Verifikasi credential database

### Upload Gambar Bermasalah
- Pastikan folder uploads memiliki izin tulis
- Cek ukuran file maksimum yang diperbolehkan
- Pastikan multer dikonfigurasi dengan benar

## Update Aplikasi

### Manual Update
1. Backup data penting
2. Pull kode terbaru: `git pull origin main`
3. Install dependensi baru jika ada: `npm install`
4. Restart aplikasi

### Zero Downtime Deployment
Gunakan PM2 Cluster Mode atau platform cloud dengan rolling updates.

## Keamanan

### Rekomendasi
- Gunakan JWT_SECRET yang kuat dan unik
- Aktifkan rate limiting
- Gunakan HTTPS untuk semua koneksi
- Jaga kerahasiaan file .env
- Update dependensi secara rutin
- Batasi akses ke endpoint admin

### Firewall
- Hanya izinkan port 80/443 yang terbuka ke publik
- Batasi akses SSH dengan IP tertentu
- Gunakan fail2ban untuk mencegah brute force