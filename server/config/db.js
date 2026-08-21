const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Mongoose handles index creation automatically on startup
    // by default based on schema definitions, but we can verify it or explicitly call syncIndexes()
    await mongoose.syncIndexes();
    console.log('Database indexes synchronized successfully.');
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
