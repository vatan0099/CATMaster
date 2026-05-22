const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.error('Hint: Make sure MONGO_URI is set in your environment variables and IP is whitelisted in Atlas.');
        process.exit(1);
    }
};

module.exports = connectDB;
