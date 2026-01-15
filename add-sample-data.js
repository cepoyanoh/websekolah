// Script untuk menambahkan data contoh kegiatan ke database
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Definisikan skema untuk kegiatan
const activitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrls: [{ type: String }]
}, { timestamps: true });

const Activity = mongoose.model('Activity', activitySchema);

const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://sd40utara_db_user:sdn40utara@dbwebsekolah.4eis5wu.mongodb.net/?appName=dbwebsekolah';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('Connected to MongoDB');
    
    // Hapus semua kegiatan yang ada
    await Activity.deleteMany({});
    
    // Tambahkan kegiatan contoh
    const sampleActivity = new Activity({
        title: "Kegiatan Ekstrakurikuler Pramuka",
        description: "Kegiatan rutin mingguan ekstrakurikuler pramuka yang diikuti oleh seluruh siswa SD Negeri 40 Pontianak Utara.",
        imageUrls: ["/images/activity-1.jpg"]
    });
    
    await sampleActivity.save();
    
    console.log('Sample activity added successfully');
    console.log('Activity:', sampleActivity);
    
    mongoose.connection.close();
})
.catch(err => {
    console.error('Connection error:', err);
});