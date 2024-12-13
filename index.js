import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './config/dbConfig.js';
import authRoutes from './routes/authRoutes.js';
import queryRoutes from './routes/queryRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';

import path from 'path';

dotenv.config();
const app = express();

// Middleware to handle JSON requests
app.use(express.json());
 


// CORS Middleware to allow requests from frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',  
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// Log when frontend connects (for debugging)
app.use((req, res, next) => {
  const origin = req.get('origin');
  if (origin === process.env.FRONTEND_URL || origin === 'http://localhost:3000') {
    console.log(`Frontend connected: ${origin}`);
  }
  next();
});

// Middleware to pass database connection to all requests
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Serve frontend in production (if applicable)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Routes
app.get('/', (req, res) => {
  res.send('Backend is up and running!');
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/queries', queryRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/users', userRoutes); 

// Error handling middleware for any errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Fallback route for undefined endpoints
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
