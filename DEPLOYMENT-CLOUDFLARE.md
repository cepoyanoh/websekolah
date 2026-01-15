# Panduan Deployment ke Cloudflare

## Ringkasan
Proyek ini adalah website untuk SD Negeri 40 Kecamatan Pontianak Utara yang terdiri dari:
- File statis: HTML, CSS, dan JavaScript untuk frontend
- Backend: Server Node.js dengan endpoint API
- Database: MongoDB untuk menyimpan berita dan kegiatan

## Arsitektur Deployment
Karena proyek ini memiliki komponen frontend dan backend, kita akan menggunakan pendekatan hybrid:

1. **Frontend** (file HTML/CSS/JS) → Cloudflare Pages
2. **Backend** (server Node.js) → Platform hosting seperti Railway, Render, atau Cyclic
3. **Database** (MongoDB) → MongoDB Atlas
4. **CDN & Keamanan** → Cloudflare

## Langkah-Langkah Deployment

### 1. Menyiapkan Repository GitHub
1. Buat repository baru di GitHub
2. Push semua file proyek ke repository tersebut
3. Pastikan file-file berikut termasuk dalam repository:
   - [index.html](file:///d:/New%20folder%20(6)/index.html), [styles.css](file:///d:/New%20folder%20(6)/styles.css), [script.js](file:///d:/New%20folder%20(6)/script.js) (frontend)
   - [server.js](file:///d:/New%20folder%20(6)/server.js), [package.json](file:///d:/New%20folder%20(6)/package.json), [.env.example](file:///d:/New%20folder%20(6)/.env.example) (backend)
   - [dashboard.html](file:///d:/New%20folder%20(6)/dashboard.html), [dashboard.js](file:///d:/New%20folder%20(6)/dashboard.js), [login.html](file:///d:/New%20folder%20(6)/login.html), [login.js](file:///d:/New%20folder%20(6)/login.js)
   - Folder [images](file:///d:/New%20folder%20(6)/images/) dan file-file lainnya

### 2. Menyiapkan Database MongoDB
1. Daftar ke [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Buat cluster gratis
3. Buat database dengan nama misalnya `sekolah_db`
4. Buat user database dan catat credentials
5. Pada tab Network Access, tambahkan IP `0.0.0.0/0` untuk mengizinkan koneksi dari mana saja
6. Pada tab Database Access, buat database user
7. Salin connection string (akan digunakan nanti)

### 3. Menyiapkan Backend di Platform Hosting
Contoh menggunakan Railway:
1. Daftar ke [Railway](https://railway.app/)
2. Klik "New Project" → "Deploy from GitHub repo"
3. Pilih repository yang telah Anda buat sebelumnya
4. Pada menu Environment Variables, tambahkan:
   - `MONGODB_URI`: connection string dari MongoDB Atlas
   - `JWT_SECRET`: string acak yang kuat untuk enkripsi token
5. Klik "Deploy Now"
6. Catat URL deployment (akan seperti `https://nama-proyek.railway.app`)

### 4. Menyiapkan Frontend di Cloudflare Pages
1. Buka [Cloudflare Pages](https://pages.cloudflare.com/)
2. Klik "Create a project" → "Connect to Git"
3. Pilih repository GitHub Anda
4. Pada konfigurasi build:
   - Build Command: biarkan kosong atau `echo "Build completed"`
   - Build Output Directory: `/` (root)
   - Root Directory: `/`
5. Klik "Save and Deploy"
6. Tunggu hingga selesai dan catat URL deployment (akan seperti `https://proyek.pages.dev`)

### 5. Mengkonfigurasi Domain dan Cloudflare
1. Dapatkan domain Anda (bisa dari registrar seperti Namecheap, GoDaddy, dll.)
2. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. Klik "Add Site" dan masukkan domain Anda
4. Pilih plan gratis
5. Cloudflare akan memberikan nameserver baru
6. Di registrar domain Anda, ganti nameserver dengan yang diberikan oleh Cloudflare
7. Tunggu propagasi DNS (bisa sampai 24-48 jam)
8. Setelah selesai, buka dashboard Cloudflare lagi

### 6. Mengkonfigurasi DNS Records
1. Di Cloudflare Dashboard → DNS → Records
2. Tambahkan DNS records berikut:
   - Type: A, Name: @, Content: IP server hosting frontend (jika Anda tidak menggunakan Cloudflare Pages)
   - Type: CNAME, Name: www, Content: [nama-proyek].pages.dev (jika menggunakan Cloudflare Pages)
   - Type: A, Name: api, Content: IP server backend (jika hosting sendiri)
   - Type: CNAME, Name: api, Content: [nama-proyek].railway.app (jika menggunakan Railway)

### 7. Mengupdate Kode untuk Production
Anda perlu mengganti URL API di file [script.js](file:///d:/New%20folder%20(6)/script.js) dan [dashboard.js](file:///d:/New%20folder%20(6)/dashboard.js):

Di [script.js](file:///d:/New%20folder%20(6)/script.js):
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' ? 
    'http://localhost:3000' : 
    'https://api.nama-domain-anda.com'; // Ganti dengan URL API Anda
```

Di [dashboard.js](file:///d:/New%20folder%20(6)/dashboard.js):
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' ? 
    'http://localhost:3000' : 
    'https://api.nama-domain-anda.com'; // Ganti dengan URL API Anda
```

### 8. Testing
1. Akses domain Anda di browser
2. Coba semua fungsi, termasuk:
   - Melihat berita dan kegiatan di halaman utama
   - Login ke admin dashboard
   - Menambahkan, mengedit, dan menghapus berita/kegiatan
   - Upload gambar

### 9. Optimasi Tambahan (Opsional)
1. Di Cloudflare Dashboard → Speed → Optimization, aktifkan Railgun jika tersedia
2. Di Page Rules, tambahkan aturan untuk caching file statis
3. Di Security, atur tingkat keamanan sesuai kebutuhan
4. Aktifkan SSL/TLS dan pilih mode "Full" atau "Full (strict)"

## Troubleshooting

### Jika API tidak bisa diakses
- Pastikan URL API di [script.js](file:///d:/New%20folder%20(6)/script.js) dan [dashboard.js](file:///d:/New%20folder%20(6)/dashboard.js) sudah benar
- Pastikan server backend berjalan dan bisa diakses
- Periksa CORS settings di server

### Jika gambar tidak muncul
- Pastikan folder upload bisa diakses (jika menggunakan hosting sendiri)
- Jika menggunakan CDN, pastikan path gambar sudah diupdate

### Jika login admin tidak berfungsi
- Pastikan endpoint login di server berfungsi
- Pastikan JWT_SECRET sudah diatur dengan benar di server

## Tips
- Backup database secara berkala
- Monitor traffic dan resource usage
- Gunakan custom domain untuk semua layanan untuk konsistensi