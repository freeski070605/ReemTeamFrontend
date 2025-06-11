/**
  * MongoDB Configuration
 * 
 * This file handles the MongoDB connection setup using Mongoose
 */

const mongoose = require('mongoose');

// MongoDB connection URI
// In production, this would be set as an environment variable
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reem-team';

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Close MongoDB connection when Node process ends
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

module.exports = {
  connectToDatabase,
  mongoose
};
 