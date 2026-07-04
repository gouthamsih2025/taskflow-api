import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Establishes a connection to the MongoDB Atlas cluster.
 * Configured with connection timeout options to prevent hanging threads.
 */
const connectDB = async () => {
  try {
    // Attempt connection using URI from environment variables
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds instead of hanging
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Error: ${error.message}`);
    process.exit(1); // Exit the process with failure
  }
};

export default connectDB;
