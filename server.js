const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection - Production ready
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://sd40utara_db_user:sdn40utara@dbwebsekolah.4eis5wu.mongodb.net/?appName=dbwebsekolah';

// Production ready connection options
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Multer setup for multiple file uploads (max 5)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('Setting destination for file:', file.fieldname);
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + path.extname(file.originalname);
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
});

const upload = multer({ 
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per file
        files: 5 // Maximum number of files
    },
    fileFilter: (req, file, cb) => {
        console.log('Processing file filter for:', file.originalname, 'with mimetype:', file.mimetype);
        // Only allow image files
        if (file.mimetype.startsWith('image/')) {
            console.log('Accepting file:', file.originalname);
            cb(null, true);
        } else {
            console.log('Rejecting non-image file:', file.originalname);
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// News Schema - modified to handle multiple images
const newsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    content: { type: String, required: true },
    imageUrls: [{ type: String }] // Changed from imageUrl to imageUrls array
}, { timestamps: true });

const News = mongoose.model('News', newsSchema);

// Activity Schema - modified to handle multiple images
const activitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrls: [{ type: String }] // Changed from imageUrl to imageUrls array
}, { timestamps: true });

const Activity = mongoose.model('Activity', activitySchema);

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key', (err, user) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Routes

// Login route
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.json({ success: false, message: 'Username atau password salah' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Username atau password salah' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({ 
            success: true, 
            message: 'Login berhasil',
            token,
            user: { id: user._id, username: user.username }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// Register admin user (for initial setup)
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Create new user
        const newUser = new User({
            username,
            password: hashedPassword
        });
        
        await newUser.save();
        
        res.json({ success: true, message: 'Akun admin berhasil dibuat' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// Public routes - untuk ditampilkan di halaman utama
app.get('/api/public/news', async (req, res) => {
    try {
        console.log('Fetching news for public endpoint');
        const news = await News.find().sort({ createdAt: -1 }).limit(3);
        console.log('Found', news.length, 'news items');
        res.json(news);
    } catch (error) {
        console.error('Error fetching public news:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

app.get('/api/public/activities', async (req, res) => {
    try {
        console.log('Fetching activities for public endpoint');
        const activities = await Activity.find().sort({ createdAt: -1 }).limit(4);
        console.log('Found', activities.length, 'activity items');
        res.json(activities);
    } catch (error) {
        console.error('Error fetching public activities:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// Protected routes - hanya untuk admin
app.get('/api/news', authenticateToken, async (req, res) => {
    try {
        console.log('Fetching all news for admin');
        const news = await News.find().sort({ createdAt: -1 });
        console.log('Found', news.length, 'news items for admin');
        res.json(news);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// Add route to get individual news item
app.get('/api/news/:id', authenticateToken, async (req, res) => {
    try {
        const news = await News.findById(req.params.id);
        if (!news) {
            return res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
        }
        res.json(news);
    } catch (error) {
        console.error('Error fetching news by ID:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// Updated route to handle multiple images with the correct field name
app.post('/api/news', authenticateToken, upload.array('images', 5), async (req, res) => {
    console.log('Received news upload request');
    console.log('Request body:', req.body);
    console.log('Number of files received:', req.files ? req.files.length : 0);
    
    if (!req.files || req.files.length === 0) {
        console.log('No files received in news upload');
        return res.status(400).json({ success: false, message: 'Minimal harus mengunggah 1 gambar' });
    }
    
    try {
        const { title, date, content } = req.body;
        
        // Validate required fields
        if (!title || !date || !content) {
            return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
        }
        
        // Get image URLs if files were uploaded
        const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
        
        const news = new News({
            title,
            date: new Date(date),
            content,
            imageUrls
        });
        
        await news.save();
        
        console.log('Saved news item with ID:', news._id);
        res.json({ success: true, message: 'Berita berhasil ditambahkan', news });
    } catch (error) {
        console.error('Error adding news:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

app.put('/api/news/:id', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const { title, date, content } = req.body;
        const updates = { title, date: new Date(date), content };
        
        // If new images are uploaded, add them to the array
        if (req.files && req.files.length > 0) {
            const newImageUrls = req.files.map(file => `/uploads/${file.filename}`);
            updates.imageUrls = [...newImageUrls]; // Replace all image URLs with new ones
        }
        
        const news = await News.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );
        
        if (!news) {
            return res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
        }
        
        res.json({ success: true, message: 'Berita berhasil diperbarui', news });
    } catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

app.delete('/api/news/:id', authenticateToken, async (req, res) => {
    try {
        const news = await News.findByIdAndDelete(req.params.id);
        
        if (!news) {
            return res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
        }
        
        res.json({ success: true, message: 'Berita berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// Activities routes
app.get('/api/activities', authenticateToken, async (req, res) => {
    try {
        console.log('Fetching all activities for admin');
        const activities = await Activity.find().sort({ createdAt: -1 });
        console.log('Found', activities.length, 'activity items for admin');
        res.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// Add route to get individual activity item
app.get('/api/activities/:id', authenticateToken, async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);
        if (!activity) {
            return res.status(404).json({ success: false, message: 'Kegiatan tidak ditemukan' });
        }
        res.json(activity);
    } catch (error) {
        console.error('Error fetching activity by ID:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// Updated route to handle multiple images with the correct field name
app.post('/api/activities', authenticateToken, upload.array('images', 5), async (req, res) => {
    console.log('Received activity upload request');
    console.log('Request body:', req.body);
    console.log('Number of files received:', req.files ? req.files.length : 0);
    
    if (!req.files || req.files.length === 0) {
        console.log('No files received in activity upload');
        return res.status(400).json({ success: false, message: 'Minimal harus mengunggah 1 gambar' });
    }
    
    try {
        const { title, description } = req.body;
        
        // Validate required fields
        if (!title || !description) {
            return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
        }
        
        // Get image URLs if files were uploaded
        const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
        
        const activity = new Activity({
            title,
            description,
            imageUrls
        });
        
        await activity.save();
        
        console.log('Saved activity item with ID:', activity._id);
        res.json({ success: true, message: 'Kegiatan berhasil ditambahkan', activity });
    } catch (error) {
        console.error('Error adding activity:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

app.put('/api/activities/:id', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const { title, description } = req.body;
        const updates = { title, description };
        
        // If new images are uploaded, replace the old ones
        if (req.files && req.files.length > 0) {
            const newImageUrls = req.files.map(file => `/uploads/${file.filename}`);
            updates.imageUrls = [...newImageUrls]; // Replace all image URLs with new ones
        }
        
        const activity = await Activity.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );
        
        if (!activity) {
            return res.status(404).json({ success: false, message: 'Kegiatan tidak ditemukan' });
        }
        
        res.json({ success: true, message: 'Kegiatan berhasil diperbarui', activity });
    } catch (error) {
        console.error('Error updating activity:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

app.delete('/api/activities/:id', authenticateToken, async (req, res) => {
    try {
        const activity = await Activity.findByIdAndDelete(req.params.id);
        
        if (!activity) {
            return res.status(404).json({ success: false, message: 'Kegiatan tidak ditemukan' });
        }
        
        res.json({ success: true, message: 'Kegiatan berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting activity:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// Serve static files - specifically serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Additionally, make sure other HTML pages are served properly
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Error handling middleware for multer
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ success: false, message: 'Field tidak dikenali. Harap pastikan nama field sesuai dengan yang diharapkan.' });
        }
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: 'File terlalu besar. Maksimal 5MB per file.' });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ success: false, message: 'Terlalu banyak file. Maksimal 5 gambar.' });
        }
        return res.status(400).json({ success: false, message: `Multer error: ${error.message}` });
    }
    
    // Menangani rute yang tidak ditemukan (404) - harus ditempatkan di akhir
    if(!res.headersSent) {
        console.log(`404 Error: Route ${req.originalUrl} not found`);
        res.status(404).json({ success: false, message: `Rute ${req.originalUrl} tidak ditemukan` });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Biarkan server diakses dari luar localhost

const server = app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    
    // Check if JWT secret is properly configured
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'secret_key_for_jwt_tokens') {
        console.warn('WARNING: Using default JWT secret. For production, please set a strong JWT_SECRET in your .env file.');
    }
});

server.on('error', (err) => {
    console.error('Server error:', err);
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please close the application using that port.`);
    }
});
