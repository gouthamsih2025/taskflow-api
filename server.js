/**
 * TaskFlow API Server Entrypoint
 * Configures the Express application, registers middlewares, mounts routes,
 * and starts the HTTP server.
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Import custom security middleware and task routes
import { securityHeaders } from './src/middleware/security.js';
import taskRouter from './src/routes/taskRoutes.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// Middleware Pipeline
// ==========================================

// 1. Helmet: Sets standard HTTP headers for app security (prevents common attacks)
app.use(helmet());

// 2. CORS: Enables Cross-Origin Resource Sharing (allows frontend apps to fetch data)
app.use(cors());

// 3. Morgan: Logs incoming HTTP requests to the console in development format
app.use(morgan('dev'));

// 4. Express JSON parser: Parses incoming requests with JSON payloads (sets req.body)
app.use(express.json());

// 5. Custom Security Headers: Applies additional specific security-related headers
app.use(securityHeaders);

// ==========================================
// Route Handlers
// ==========================================

// Base API route information
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'TaskFlow API',
    version: '1.0.0',
    description: 'RESTful task management service',
    endpoints: {
      tasks: '/api/tasks'
    }
  });
});

// Mount the modular tasks router
app.use('/api/tasks', taskRouter);

// ==========================================
// Error & Fallback Handlers
// ==========================================

// Fallback Middleware: Handles requests to unregistered endpoints (404 Page Not Found)
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Centralized Error-Handling Middleware: Catches all unhandled exceptions in the route pipeline
app.use((err, req, res, next) => {
  console.error('Unhandled Error Stack:', err.stack);
  
  // Respond with a generic 500 Internal Server Error, keeping server details hidden
  res.status(500).json({ error: 'Internal Server Error' });
});

// ==========================================
// Start Server
// ==========================================
app.listen(PORT, () => {
  console.log(`TaskFlow API running on port ${PORT}`);
});
