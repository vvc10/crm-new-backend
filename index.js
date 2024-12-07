import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Import CORS middleware
import db from './config/dbConfig.js';
import authRoutes from './routes/authRoutes.js';
import queryRoutes from './routes/queryRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();
const app = express();

// Middleware to handle JSON requests
app.use(express.json());

// CORS Middleware to allow requests from the frontend
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from this origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow these HTTP methods
    credentials: true, // Allow cookies if needed
  })
);

// Middleware to pass database connection to all requests
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Routes
app.use('/api/v1/auth', authRoutes);   
app.use('/api/payments', paymentRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/admin', adminRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
