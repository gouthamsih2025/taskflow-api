/**
 * TaskFlow API Server Entrypoint
 * Configures the Express application, registers middlewares, connects to MongoDB,
 * and starts the HTTP server.
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Import database connection and routes
import connectDB from './src/db/connect.js';
import { securityHeaders } from './src/middleware/security.js';
import taskRouter from './src/routes/taskRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// Middleware Pipeline
// ==========================================

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(securityHeaders);

// ==========================================
// Route Handlers
// ==========================================

app.get('/', (req, res) => {
  res.status(200).json({
    name: 'TaskFlow DB API',
    version: '1.1.0',
    description: 'RESTful task management service backed by MongoDB Atlas',
    endpoints: {
      tasks: '/api/tasks',
      search: '/api/tasks/search'
    }
  });
});

app.use('/api/tasks', taskRouter);

// ==========================================
// Error & Fallback Handlers
// ==========================================

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled Error Stack:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ==========================================
// Start Server and Database Connection
// ==========================================
const startServer = async () => {
  try {
    // Establish database connection first
    await connectDB();
    
    // Start listening for client requests
    app.listen(PORT, () => {
      console.log(`TaskFlow API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Fatal initialization error:', error.message);
    process.exit(1);
  }
};

startServer();
