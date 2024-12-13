import express from 'express';
import {
  registerUser,
  generateLoginOtp,
  loginUser,
  logoutUser,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser); // Send OTP for registration
router.post('/generate-login-otp', generateLoginOtp); // Generate OTP for login
router.post('/login', loginUser); // Login with OTP
router.post('/logout', logoutUser); // Logout user

export default router;
