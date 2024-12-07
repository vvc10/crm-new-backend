import express from 'express';
import { registerAdmin, loginAdmin } from '../controllers/adminController.js';

const router = express.Router();

// Route to register admin
router.post('/register', registerAdmin);

// Route for admin login (verify OTP)
router.post('/login', loginAdmin);

export default router;
