import express from 'express';
import { registerAdmin, loginAdmin, sendOtp } from '../controllers/adminController.js';

const router = express.Router();

// Route to register admin
router.post('/register', registerAdmin);

// Route for admin login (verify OTP)
router.post('/login', loginAdmin);

// Route to send OTP
router.post('/send-otp', sendOtp);

export default router;
