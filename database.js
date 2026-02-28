const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Check if MONGODB_URI exists
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is not defined in .env file');
            process.exit(1);
        }

        // Remove deprecated options - they're not needed in Mongoose 7+
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('✅ MongoDB connected successfully');
        console.log('📊 Database:', process.env.MONGODB_URI.split('/').pop());
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;