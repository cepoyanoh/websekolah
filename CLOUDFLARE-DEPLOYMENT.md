# Deployment ke Cloudflare

## Pendahuluan
Karena aplikasi ini memiliki komponen backend (Node.js server) dan database (MongoDB), kita tidak bisa hanya menggunakan Cloudflare Pages saja. Kita perlu pendekatan hybrid:

1. Frontend (HTML, CSS, JS) → Cloudflare Pages
2. Backend (Node.js API) → Platform hosting lain (Railway, Render, Heroku, dll.)
3. Database → MongoDB Atlas

## Langkah-langkah Deployment

### 1. Deploy Backend ke Platform Lain (contoh: Railway)

1. Buat akun di [Railway](https://railway.app/)
2. Buat proyek baru dan pilih "Deploy from GitHub repo"
3. Pilih repositori Anda
4. Tambahkan environment variables:
   - MONGODB_URI (dari MongoDB Atlas)
   - JWT_SECRET (kunci rahasia untuk token JWT)
5. Deploy aplikasi
6. Catat URL deployment (misalnya: `https://your-app-production.up.railway.app`)

### 2. Deploy Frontend ke Cloudflare Pages

1. Simpan semua file ke repositori GitHub
2. Buka https://pages.cloudflare.com/
3. Klik "Create a project"
4. Pilih "Connect to Git"
5. Pilih repositori Anda
6. Konfigurasi build:
   - Build command: `npm run build` atau `echo "Build completed"`
   - Build output directory: `/` (root)
   - Root directory: `/`
7. Klik "Save and deploy"
8. Catat URL deployment (misalnya: `https://your-project.pages.dev`)

### 3. Konfigurasi DNS di Cloudflare

1. Tambahkan domain Anda ke Cloudflare
2. Ganti nameserver domain Anda ke milik Cloudflare
3. Di Cloudflare Dashboard → DNS → Records, tambahkan records:
   - A record untuk root domain mengarah ke IP server hosting backend
   - CNAME record untuk subdomain (www) mengarah ke Cloudflare Pages
   - CNAME record untuk API (api.yourdomain.com) mengarah ke backend

### 4. Update Kode untuk Production

Ubah URL API di [script.js](file:///d:/New%20folder%20(6)/script.js) dan [dashboard.js](file:///d:/New%20folder%20(6)/dashboard.js):

```javascript
// Di script.js
const API_BASE_URL = window.location.hostname === 'localhost' ? 
    'http://localhost:3000' : 
    'https://api.yourdomain.com'; // Ganti dengan URL backend Anda
```

```javascript
// Di dashboard.js
const API_BASE_URL = window.location.hostname === 'localhost' ? 
    'http://localhost:3000' : 
    'https://api.yourdomain.com'; // Ganti dengan URL backend Anda
```

## Alternatif: Gunakan Cloudflare Workers untuk Reverse Proxy

Jika Anda ingin menggunakan domain utama untuk API, Anda bisa membuat Cloudflare Worker untuk reverse proxy ke backend Anda:

1. Buka Cloudflare Dashboard → Workers & Pages
2. Buat Worker baru
3. Gunakan kode berikut:

```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Redirect API calls to your backend
    if (url.pathname.startsWith('/api/')) {
      const backendUrl = 'https://your-backend-url.railway.app' + url.pathname + url.search;
      
      const newRequest = new Request(backendUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
      
      return fetch(newRequest);
    }
    
    // Serve static assets from Pages
    return env.ASSETS.fetch(request);
  }
};
```

## Keamanan dan Optimasi

### Rate Limiting
Gunakan Cloudflare Rate Limiting untuk mencegah abuse terhadap API Anda.

### SSL Certificate
Cloudflare akan menyediakan SSL certificate gratis untuk domain Anda.

### Caching
- Aktifkan Cloudflare caching untuk asset statis
- Gunakan Cloudflare Cache Rules untuk mengatur strategi caching
- Gunakan Edge TTL untuk mengatur berapa lama konten disimpan di edge

## Monitoring dan Analytics

### Cloudflare Analytics
- Gunakan Cloudflare Analytics untuk melihat traffic
- Pantau potensi serangan dan anomali

### Custom Analytics
- Tambahkan Google Analytics atau layanan analytics lainnya ke halaman Anda
- Gunakan Cloudflare Logs untuk analisis lebih lanjut

## Troubleshooting

### API Calls Diblokir
- Pastikan CORS diatur dengan benar di server
- Periksa apakah Cloudflare Security Level terlalu ketat

### Mixed Content Issues
- Pastikan semua request menggunakan HTTPS
- Gunakan API_BASE_URL yang benar di production

### Latency Issues
- Pastikan backend Anda berlokasi geografis yang dekat dengan pengguna utama
- Gunakan Cloudflare CDN secara optimal