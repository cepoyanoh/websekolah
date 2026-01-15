// File uji untuk menguji endpoint API
require('dotenv').config();
const mongoose = require('mongoose');

// Koneksi ke database
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://sd40utara_db_user:sdn40utara@dbwebsekolah.4eis5wu.mongodb.net/?appName=dbwebsekolah';
mongoose.connect(mongoURI);

// Skema berita dan kegiatan
const newsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    content: { type: String, required: true },
    imageUrls: [{ type: String }]
}, { timestamps: true });

const News = mongoose.model('News', newsSchema);

const activitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrls: [{ type: String }]
}, { timestamps: true });

const Activity = mongoose.model('Activity', activitySchema);

async function testEndpoints() {
    console.log('Testing API endpoints...\n');
    
    try {
        // Ambil satu berita
        const news = await News.findOne();
        if (news) {
            console.log('Found news item:');
            console.log('- ID:', news._id);
            console.log('- Title:', news.title);
            console.log('- Content length:', news.content.length);
            console.log('- Image count:', news.imageUrls.length);
            console.log('');
        } else {
            console.log('No news items found in database\n');
        }
        
        // Ambil satu kegiatan
        const activity = await Activity.findOne();
        if (activity) {
            console.log('Found activity item:');
            console.log('- ID:', activity._id);
            console.log('- Title:', activity.title);
            console.log('- Description length:', activity.description.length);
            console.log('- Image count:', activity.imageUrls.length);
            console.log('');
        } else {
            console.log('No activity items found in database\n');
        }
        
        mongoose.connection.close();
    } catch (error) {
        console.error('Error testing endpoints:', error);
        mongoose.connection.close();
    }
}

testEndpoints();