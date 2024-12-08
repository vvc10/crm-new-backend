import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './config/dbConfig.js';
import authRoutes from './routes/authRoutes.js';
import queryRoutes from './routes/queryRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();
const app = express();

// Middleware to handle JSON requests
app.use(express.json());

// CORS Middleware to allow requests from frontend
app.use(
  cors({
    origin: "https://crm-new-ry3x.vercel.app", // Update this if necessary
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Log when frontend connects
app.use((req, res, next) => {
  const origin = req.get('origin');
  if (origin === "https://crm-new-ry3x.vercel.app") {
    console.log(`Frontend connected: ${origin}`);
  }
  next();
});

// Middleware to pass database connection to all requests
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('Backend is up and running!');
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/admin', adminRoutes);

// Fallback route for undefined endpoints
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
