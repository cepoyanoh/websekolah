// Tetapkan base URL untuk API berdasarkan lingkungan
const API_BASE_URL = window.location.hostname === 'localhost' ? 
    'http://localhost:3000' : 
    'https://api.namadomainanda.com'; // Ganti dengan domain API Anda

// Fungsi untuk preview gambar
function previewImages(input, previewContainerId) {
    const previewContainer = document.getElementById(previewContainerId);
    const files = input.files;
    
    // Batasi jumlah gambar maksimal 5
    if (files.length > 5) {
        alert('Maksimal hanya 5 gambar yang dapat diupload');
        input.value = ''; // Reset input
        return;
    }
    
    // Hapus preview sebelumnya
    previewContainer.innerHTML = '';
    
    // Tampilkan preview untuk setiap gambar
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.match('image.*')) continue; // Lewati jika bukan gambar
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const imgContainer = document.createElement('div');
            imgContainer.style.position = 'relative';
            imgContainer.style.display = 'inline-block';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'image-preview';
            img.title = file.name;
            
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '×';
            removeBtn.className = 'remove-image';
            removeBtn.onclick = function() {
                imgContainer.remove();
                updateFileInput(input, previewContainerId);
            };
            
            imgContainer.appendChild(img);
            imgContainer.appendChild(removeBtn);
            previewContainer.appendChild(imgContainer);
        };
        
        reader.readAsDataURL(file);
    }
}

// Fungsi untuk memperbarui input file setelah menghapus gambar
function updateFileInput(input, previewContainerId) {
    const previewContainer = document.getElementById(previewContainerId);
    const imageCount = previewContainer.children.length;
    
    if (imageCount === 0) {
        input.value = '';
    }
}

// Cek apakah pengguna sudah login
if (!localStorage.getItem('adminToken')) {
    window.location.href = 'login.html';
}

// Logout function
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    window.location.href = 'login.html';
});

// Menu navigation - Memperbaiki fungsi navigasi antar bagian
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Hapus kelas 'active' dari semua menu item
        document.querySelectorAll('.menu-item').forEach(menuItem => {
            menuItem.classList.remove('active');
        });
        
        // Tambahkan kelas 'active' ke menu item yang diklik
        this.classList.add('active');
        
        // Sembunyikan semua bagian konten
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden');
        });
        
        // Tampilkan bagian konten yang sesuai
        const targetSection = document.getElementById(this.getAttribute('data-section'));
        if (targetSection) {
            targetSection.classList.remove('hidden');
            
            // Muat data jika mengakses bagian kelola
            if (this.getAttribute('data-section') === 'manage-news') {
                loadNewsData();
            } else if (this.getAttribute('data-section') === 'manage-activities') {
                loadActivitiesData();
            }
        }
    });
});

// Handle news form submission
document.getElementById('newsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const imageInputs = document.getElementById('newsImages');
    const newsId = document.getElementById('newsForm').dataset.id; // Ambil ID berita jika sedang mengedit
    
    console.log('Number of files selected for news:', imageInputs.files.length);
    
    // Validasi: Pastikan minimal ada 1 gambar dan maksimal 5 gambar
    if (imageInputs.files.length < 1) {
        alert('Minimal harus mengunggah 1 gambar untuk berita');
        return;
    }
    
    if (imageInputs.files.length > 5) {
        alert('Maksimal hanya 5 gambar yang dapat diupload');
        return;
    }
    
    const formData = new FormData();
    formData.append('title', document.getElementById('newsTitle').value);
    formData.append('date', document.getElementById('newsDate').value);
    formData.append('content', document.getElementById('newsContent').value);
    
    // Ambil semua file gambar dengan nama field yang benar
    for (let i = 0; i < imageInputs.files.length; i++) {
        console.log('Adding file to form data:', imageInputs.files[i].name);
        formData.append('images', imageInputs.files[i]); // Sesuaikan dengan field yang diharapkan oleh multer
    }
    
    console.log('FormData ready, sending request...');
    
    try {
        let url, method;
        if (newsId) {
            // Jika sedang mengedit
            url = `${API_BASE_URL}/api/news/${newsId}`;
            method = 'PUT';
        } else {
            // Jika sedang menambahkan
            url = `${API_BASE_URL}/api/news`;
            method = 'POST';
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: formData
        });
        
        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Response data:', result);
        
        if (result.success) {
            alert(newsId ? 'Berita berhasil diperbarui' : 'Berita berhasil ditambahkan');
            document.getElementById('newsForm').reset();
            document.getElementById('newsPreview').innerHTML = ''; // Reset preview
            document.getElementById('newsForm').removeAttribute('data-id'); // Hapus ID dari form
            
            // Ganti tombol kembali ke simpan
            document.querySelector('#newsSubmitBtn').textContent = 'Simpan Berita';
            
            // Refresh data di tabel berita
            if(document.querySelector('.menu-item[data-section="manage-news"]').classList.contains('active')) {
                loadNewsData();
            }
        } else {
            alert(result.message || (newsId ? 'Gagal memperbarui berita' : 'Gagal menambahkan berita'));
        }
    } catch (error) {
        console.error('Error processing news:', error);
        alert('Terjadi kesalahan: ' + error.message);
    }
});

// Handle activity form submission
document.getElementById('activityForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const imageInputs = document.getElementById('activityImages');
    const activityId = document.getElementById('activityForm').dataset.id; // Ambil ID kegiatan jika sedang mengedit
    
    console.log('Number of files selected for activity:', imageInputs.files.length);
    
    // Validasi: Pastikan minimal ada 1 gambar dan maksimal 5 gambar
    if (imageInputs.files.length < 1) {
        alert('Minimal harus mengunggah 1 gambar untuk kegiatan');
        return;
    }
    
    if (imageInputs.files.length > 5) {
        alert('Maksimal hanya 5 gambar yang dapat diupload');
        return;
    }
    
    const formData = new FormData();
    formData.append('title', document.getElementById('activityTitle').value);
    formData.append('description', document.getElementById('activityDescription').value);
    
    // Ambil semua file gambar dengan nama field yang benar
    for (let i = 0; i < imageInputs.files.length; i++) {
        console.log('Adding file to form data:', imageInputs.files[i].name);
        formData.append('images', imageInputs.files[i]); // Sesuaikan dengan field yang diharapkan oleh multer
    }
    
    console.log('FormData ready, sending request...');
    
    try {
        let url, method;
        if (activityId) {
            // Jika sedang mengedit
            url = `${API_BASE_URL}/api/activities/${activityId}`;
            method = 'PUT';
        } else {
            // Jika sedang menambahkan
            url = `${API_BASE_URL}/api/activities`;
            method = 'POST';
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: formData
        });
        
        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Response data:', result);
        
        if (result.success) {
            alert(activityId ? 'Kegiatan berhasil diperbarui' : 'Kegiatan berhasil ditambahkan');
            document.getElementById('activityForm').reset();
            document.getElementById('activityPreview').innerHTML = ''; // Reset preview
            document.getElementById('activityForm').removeAttribute('data-id'); // Hapus ID dari form
            
            // Ganti tombol kembali ke simpan
            document.querySelector('#activitySubmitBtn').textContent = 'Simpan Kegiatan';
            
            // Refresh data di tabel kegiatan
            if(document.querySelector('.menu-item[data-section="manage-activities"]').classList.contains('active')) {
                loadActivitiesData();
            }
        } else {
            alert(result.message || (activityId ? 'Gagal memperbarui kegiatan' : 'Gagal menambahkan kegiatan'));
        }
    } catch (error) {
        console.error('Error processing activity:', error);
        alert('Terjadi kesalahan: ' + error.message);
    }
});

// Load news data
async function loadNewsData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/news`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        const news = await response.json();
        
        const tbody = document.querySelector('#newsTable tbody');
        tbody.innerHTML = '';
        
        news.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.title}</td>
                <td>${new Date(item.date).toLocaleDateString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-submit btn-edit" onclick="editNews('${item._id}')">Edit</button>
                        <button class="btn-submit btn-delete" onclick="deleteNews('${item._id}')">Hapus</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading news:', error);
    }
}

// Load activities data
async function loadActivitiesData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/activities`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        const activities = await response.json();
        
        const tbody = document.querySelector('#activitiesTable tbody');
        tbody.innerHTML = '';
        
        activities.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.title}</td>
                <td>${item.description.substring(0, 50)}${item.description.length > 50 ? '...' : ''}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-submit btn-edit" onclick="editActivity('${item._id}')">Edit</button>
                        <button class="btn-submit btn-delete" onclick="deleteActivity('${item._id}')">Hapus</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading activities:', error);
    }
}

// Edit news function
async function editNews(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/news/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response from API:', errorData);
            throw new Error(errorData.message || 'Gagal mengambil data berita');
        }
        
        const news = await response.json();
        
        // Isi form dengan data berita
        document.getElementById('newsTitle').value = news.title;
        document.getElementById('newsDate').value = news.date.split('T')[0]; // Format tanggal YYYY-MM-DD
        document.getElementById('newsContent').value = news.content;
        
        // Tampilkan preview gambar yang sudah ada
        const newsPreview = document.getElementById('newsPreview');
        newsPreview.innerHTML = '';
        
        if (news.imageUrls && news.imageUrls.length > 0) {
            news.imageUrls.forEach(imageUrl => {
                const imgContainer = document.createElement('div');
                imgContainer.style.position = 'relative';
                imgContainer.style.display = 'inline-block';
                
                const img = document.createElement('img');
                img.src = imageUrl;
                img.className = 'image-preview';
                img.style.width = '100px';
                img.style.height = '100px';
                img.style.objectFit = 'cover';
                
                const removeBtn = document.createElement('button');
                removeBtn.innerHTML = '×';
                removeBtn.className = 'remove-image';
                removeBtn.onclick = function() {
                    imgContainer.remove();
                };
                
                imgContainer.appendChild(img);
                imgContainer.appendChild(removeBtn);
                newsPreview.appendChild(imgContainer);
            });
        }
        
        // Simpan ID berita ke form
        document.getElementById('newsForm').dataset.id = news._id;
        
        // Ganti teks tombol menjadi "Update Berita"
        document.querySelector('#newsSubmitBtn').textContent = 'Update Berita';
        
        // Pindah ke tab Tambah Berita
        document.querySelectorAll('.menu-item').forEach(menuItem => {
            menuItem.classList.remove('active');
        });
        
        document.querySelector('.menu-item[data-section="add-news"]').classList.add('active');
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById('add-news').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error editing news:', error);
        alert('Gagal mengambil data berita: ' + error.message);
    }
}

// Delete news function
async function deleteNews(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus berita ini?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/news/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Berita berhasil dihapus');
            loadNewsData(); // Refresh the table
            
            // Memberi jeda sebelum reload halaman utama untuk memastikan perubahan terlihat
            setTimeout(() => {
                window.dispatchEvent(new Event('storage')); // Trigger event untuk reload data di halaman utama
            }, 1000);
        } else {
            alert(result.message || 'Gagal menghapus berita');
        }
    } catch (error) {
        console.error('Error deleting news:', error);
        alert('Terjadi kesalahan saat menghapus berita');
    }
}

// Edit activity function
async function editActivity(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/activities/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response from API:', errorData);
            throw new Error(errorData.message || 'Gagal mengambil data kegiatan');
        }
        
        const activity = await response.json();
        
        // Isi form dengan data kegiatan
        document.getElementById('activityTitle').value = activity.title;
        document.getElementById('activityDescription').value = activity.description;
        
        // Tampilkan preview gambar yang sudah ada
        const activityPreview = document.getElementById('activityPreview');
        activityPreview.innerHTML = '';
        
        if (activity.imageUrls && activity.imageUrls.length > 0) {
            activity.imageUrls.forEach(imageUrl => {
                const imgContainer = document.createElement('div');
                imgContainer.style.position = 'relative';
                imgContainer.style.display = 'inline-block';
                
                const img = document.createElement('img');
                img.src = imageUrl;
                img.className = 'image-preview';
                img.style.width = '100px';
                img.style.height = '100px';
                img.style.objectFit = 'cover';
                
                const removeBtn = document.createElement('button');
                removeBtn.innerHTML = '×';
                removeBtn.className = 'remove-image';
                removeBtn.onclick = function() {
                    imgContainer.remove();
                };
                
                imgContainer.appendChild(img);
                imgContainer.appendChild(removeBtn);
                activityPreview.appendChild(imgContainer);
            });
        }
        
        // Simpan ID kegiatan ke form
        document.getElementById('activityForm').dataset.id = activity._id;
        
        // Ganti teks tombol menjadi "Update Kegiatan"
        document.querySelector('#activitySubmitBtn').textContent = 'Update Kegiatan';
        
        // Pindah ke tab Tambah Kegiatan
        document.querySelectorAll('.menu-item').forEach(menuItem => {
            menuItem.classList.remove('active');
        });
        
        document.querySelector('.menu-item[data-section="add-activity"]').classList.add('active');
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById('add-activity').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error editing activity:', error);
        alert('Gagal mengambil data kegiatan: ' + error.message);
    }
}

// Delete activity function
async function deleteActivity(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/activities/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Kegiatan berhasil dihapus');
            loadActivitiesData(); // Refresh the table
            
            // Memberi jeda sebelum reload halaman utama untuk memastikan perubahan terlihat
            setTimeout(() => {
                window.dispatchEvent(new Event('storage')); // Trigger event untuk reload data di halaman utama
            }, 1000);
        } else {
            alert(result.message || 'Gagal menghapus kegiatan');
        }
    } catch (error) {
        console.error('Error deleting activity:', error);
        alert('Terjadi kesalahan saat menghapus kegiatan');
    }
}

// Menetapkan Tambah Berita sebagai bagian yang aktif secara default
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('add-news').classList.remove('hidden');
});