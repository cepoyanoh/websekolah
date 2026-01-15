// JavaScript untuk fungsi-fungsi interaktif pada website SD Negeri 40 Kecamatan Pontianak Utara

// Fungsi untuk navigasi smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        window.scrollTo({
            top: targetElement.offsetTop - 70,
            behavior: 'smooth'
        });
    });
});

// Fungsi untuk form kontak - hanya diterapkan jika elemen tersedia
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Ambil nilai dari form
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const message = this.querySelector('textarea').value;
        
        // Validasi sederhana
        if(name && email && message) {
            alert(`Terima kasih ${name}, pesan Anda telah dikirim!`);
            this.reset(); // Reset form setelah submit
        } else {
            alert('Mohon lengkapi semua field sebelum mengirim!');
        }
    });
}

// Fungsi untuk toggle menu mobile (jika dibutuhkan nanti)
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Fungsi untuk animasi saat scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.facility-item, .news-item, .leader-card');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if(elementPosition < screenPosition) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// Tambahkan event listener untuk scroll
window.addEventListener('scroll', animateOnScroll);

// Inisialisasi animasi untuk elemen-elemen tertentu
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.facility-item, .news-item, .leader-card');
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    // Panggil fungsi pertama kali saat halaman dimuat
    animateOnScroll();
    
    // Muat berita dan kegiatan dari API
    loadNewsFromAPI();
    loadActivitiesFromAPI();
    
    // Atur interval untuk memperbarui data setiap 2 menit (120000 ms)
    setInterval(() => {
        console.log('Refreshing news and activities data...');
        loadNewsFromAPI();
        loadActivitiesFromAPI();
    }, 120000);
});

// Fungsi untuk mengambil dan menampilkan berita dari API dengan fallback ke localStorage
async function loadNewsFromAPI() {
    try {
        console.log('Loading news from API...');
        // Tambahkan parameter cache buster untuk memastikan data terbaru
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/public/news?t=${timestamp}`);
        
        console.log('News API response status:', response.status);
        
        if(response.ok) {
            const news = await response.json();
            console.log('Received news data:', news);
            
            // Simpan ke localStorage sebagai fallback
            localStorage.setItem('cachedNews', JSON.stringify(news));
            
            // Pastikan bahwa kita menerima data sebelum menampilkannya
            if(Array.isArray(news) && news.length > 0) {
                displayNews(news);
            } else {
                // Coba tampilkan dari localStorage jika API kosong
                const cachedNews = JSON.parse(localStorage.getItem('cachedNews') || '[]');
                if(cachedNews.length > 0) {
                    console.log('Displaying cached news due to empty API response');
                    displayNews(cachedNews);
                } else {
                    document.getElementById('newsContainer').innerHTML = '<p>Belum ada berita yang tersedia.</p>';
                }
            }
        } else if(response.status === 404) {
            console.error('API endpoint /api/public/news not found');
            // Coba tampilkan dari localStorage jika API tidak ditemukan
            const cachedNews = JSON.parse(localStorage.getItem('cachedNews') || '[]');
            if(cachedNews.length > 0) {
                console.log('Displaying cached news due to API error');
                displayNews(cachedNews);
            } else {
                document.getElementById('newsContainer').innerHTML = '<p>Endpoint berita tidak ditemukan. Silakan hubungi administrator.</p>';
            }
        } else {
            console.error('Gagal mengambil berita:', response.status);
            // Coba tampilkan dari localStorage jika API gagal
            const cachedNews = JSON.parse(localStorage.getItem('cachedNews') || '[]');
            if(cachedNews.length > 0) {
                console.log('Displaying cached news due to API failure');
                displayNews(cachedNews);
            } else {
                document.getElementById('newsContainer').innerHTML = '<p>Gagal memuat berita. Silakan coba lagi nanti.</p>';
            }
        }
    } catch (error) {
        console.error('Error saat mengambil berita:', error);
        // Coba tampilkan dari localStorage jika terjadi error
        const cachedNews = JSON.parse(localStorage.getItem('cachedNews') || '[]');
        if(cachedNews.length > 0) {
            console.log('Displaying cached news due to network error');
            displayNews(cachedNews);
        } else {
            document.getElementById('newsContainer').innerHTML = '<p>Gagal memuat berita. Silakan coba lagi nanti.</p>';
        }
    }
}

// Fungsi untuk menampilkan berita
function displayNews(news) {
    const container = document.getElementById('newsContainer');
    
    if(news.length === 0) {
        container.innerHTML = '<p>Belum ada berita yang tersedia.</p>';
        return;
    }
    
    // Bangun HTML untuk berita
    let newsHTML = '';
    news.forEach(item => {
        // Gunakan gambar pertama dari array imageUrls, atau gunakan gambar default jika tidak ada
        const imageUrl = item.imageUrls && item.imageUrls.length > 0 ? 
            item.imageUrls[0] : 
            'images/news-default.jpg';
        
        newsHTML += `
            <article class="news-item">
                <img src="${imageUrl}" alt="${item.title}">
                <h3>${item.title}</h3>
                <p class="date">${new Date(item.date).toLocaleDateString('id-ID')}</p>
                <p>${item.content.substring(0, 150)}${item.content.length > 150 ? '...' : ''}</p>
            </article>
        `;
    });
    
    container.innerHTML = newsHTML;
    console.log('News displayed successfully');
}

// Fungsi untuk mengambil dan menampilkan kegiatan dari API dengan fallback ke localStorage
async function loadActivitiesFromAPI() {
    try {
        console.log('Loading activities from API...');
        // Tambahkan parameter cache buster untuk memastikan data terbaru
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/public/activities?t=${timestamp}`);
        
        console.log('Activities API response status:', response.status);
        
        if(response.ok) {
            const activities = await response.json();
            console.log('Received activities data:', activities);
            
            // Simpan ke localStorage sebagai fallback
            localStorage.setItem('cachedActivities', JSON.stringify(activities));
            
            // Pastikan bahwa kita menerima data sebelum menampilkannya
            if(Array.isArray(activities) && activities.length > 0) {
                displayActivities(activities);
            } else {
                // Coba tampilkan dari localStorage jika API kosong
                const cachedActivities = JSON.parse(localStorage.getItem('cachedActivities') || '[]');
                if(cachedActivities.length > 0) {
                    console.log('Displaying cached activities due to empty API response');
                    displayActivities(cachedActivities);
                } else {
                    document.getElementById('activitiesContainer').innerHTML = '<p>Belum ada kegiatan yang tersedia.</p>';
                }
            }
        } else if(response.status === 404) {
            console.error('API endpoint /api/public/activities not found');
            // Coba tampilkan dari localStorage jika API tidak ditemukan
            const cachedActivities = JSON.parse(localStorage.getItem('cachedActivities') || '[]');
            if(cachedActivities.length > 0) {
                console.log('Displaying cached activities due to API error');
                displayActivities(cachedActivities);
            } else {
                document.getElementById('activitiesContainer').innerHTML = '<p>Endpoint kegiatan tidak ditemukan. Silakan hubungi administrator.</p>';
            }
        } else {
            console.error('Gagal mengambil kegiatan:', response.status);
            // Coba tampilkan dari localStorage jika API gagal
            const cachedActivities = JSON.parse(localStorage.getItem('cachedActivities') || '[]');
            if(cachedActivities.length > 0) {
                console.log('Displaying cached activities due to API failure');
                displayActivities(cachedActivities);
            } else {
                document.getElementById('activitiesContainer').innerHTML = '<p>Gagal memuat kegiatan. Silakan coba lagi nanti.</p>';
            }
        }
    } catch (error) {
        console.error('Error saat mengambil kegiatan:', error);
        // Coba tampilkan dari localStorage jika terjadi error
        const cachedActivities = JSON.parse(localStorage.getItem('cachedActivities') || '[]');
        if(cachedActivities.length > 0) {
            console.log('Displaying cached activities due to network error');
            displayActivities(cachedActivities);
        } else {
            document.getElementById('activitiesContainer').innerHTML = '<p>Gagal memuat kegiatan. Silakan coba lagi nanti.</p>';
        }
    }
}

// Fungsi untuk menampilkan kegiatan
function displayActivities(activities) {
    const container = document.getElementById('activitiesContainer');
    
    if(activities.length === 0) {
        container.innerHTML = '<p>Belum ada kegiatan yang tersedia.</p>';
        return;
    }
    
    // Bangun HTML untuk kegiatan
    let activitiesHTML = '';
    activities.forEach(item => {
        // Gunakan gambar pertama dari array imageUrls, atau gunakan gambar default jika tidak ada
        const imageUrl = item.imageUrls && item.imageUrls.length > 0 ? 
            item.imageUrls[0] : 
            'images/activity-default.jpg';
            
        activitiesHTML += `
            <div class="gallery-item">
                <img src="${imageUrl}" alt="${item.title}">
                <div class="activity-title">${item.title}</div>
            </div>
        `;
    });
    
    container.innerHTML = activitiesHTML;
    console.log('Activities displayed successfully');
}

// Fungsi untuk slideshow jika diperlukan di masa depan
let slideIndex = 0;
function showSlides() {
    const slides = document.getElementsByClassName("slide");
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex > slides.length) {slideIndex = 1}
    slides[slideIndex-1].style.display = "block";
    setTimeout(showSlides, 5000); // Ganti gambar setiap 5 detik
}

// Fungsi untuk mengatur waktu aktif pada link navigasi
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav ul li a');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if(pageYOffset >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if(link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Fungsi untuk menguji koneksi ke API saat halaman dimuat
document.addEventListener('DOMContentLoaded', async function() {
    // Uji koneksi ke API
    try {
        console.log('Testing API connections...');
        
        const newsResponse = await fetch('/api/public/news');
        const activitiesResponse = await fetch('/api/public/activities');
        
        console.log('News API test response:', newsResponse.status);
        console.log('Activities API test response:', activitiesResponse.status);
        
        if (!newsResponse.ok) {
            console.error('Error connecting to news API:', newsResponse.status);
        }
        if (!activitiesResponse.ok) {
            console.error('Error connecting to activities API:', activitiesResponse.status);
        }
        
        // Coba ambil data langsung untuk debugging
        if (newsResponse.ok) {
            const newsData = await newsResponse.json();
            console.log('Direct news data from test:', newsData);
        }
        
        if (activitiesResponse.ok) {
            const activitiesData = await activitiesResponse.json();
            console.log('Direct activities data from test:', activitiesData);
        }
    } catch (error) {
        console.error('Network error when testing API connection:', error);
    }
});

// Cek apakah DOM elements ada saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking for containers...');
    const newsContainer = document.getElementById('newsContainer');
    const activitiesContainer = document.getElementById('activitiesContainer');
    
    console.log('News container found:', !!newsContainer);
    console.log('Activities container found:', !!activitiesContainer);
    
    if (!newsContainer) {
        console.error('News container element not found!');
    }
    
    if (!activitiesContainer) {
        console.error('Activities container element not found!');
    }
    
    // Coba tampilkan data dari localStorage saat halaman dimuat jika API belum diakses
    const cachedNews = JSON.parse(localStorage.getItem('cachedNews') || '[]');
    const cachedActivities = JSON.parse(localStorage.getItem('cachedActivities') || '[]');
    
    if (cachedNews.length > 0) {
        console.log('Displaying cached news initially');
        displayNews(cachedNews);
    }
    
    if (cachedActivities.length > 0) {
        console.log('Displaying cached activities initially');
        displayActivities(cachedActivities);
    }
});