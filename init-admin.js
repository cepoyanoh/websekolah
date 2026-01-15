const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://sd40utara_db_user:sdn40utara@dbwebsekolah.4eis5wu.mongodb.net/?appName=dbwebsekolah';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('Connected to MongoDB');
    
    // Create default admin user
    const defaultUsername = 'admin';
    const defaultPassword = 'admin123';
    
    try {
        // Check if admin user already exists
        const existingUser = await User.findOne({ username: defaultUsername });
        
        if (existingUser) {
            console.log(`Admin user '${defaultUsername}' already exists`);
            console.log('Use these credentials to login:');
            console.log(`Username: ${defaultUsername}`);
            console.log(`Password: ${defaultPassword}`);
            mongoose.connection.close();
            return;
        }
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);
        
        // Create new user
        const newUser = new User({
            username: defaultUsername,
            password: hashedPassword
        });
        
        await newUser.save();
        
        console.log(`Admin user created successfully!`);
        console.log(`Username: ${defaultUsername}`);
        console.log(`Password: ${defaultPassword}`);
        
        mongoose.connection.close();
    } catch (error) {
        console.error('Error creating admin user:', error);
        mongoose.connection.close();
    }
})
.catch(err => console.error('MongoDB connection error:', err));