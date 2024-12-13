import express from 'express';
import { createPayment, getPaymentsByUser, getAllPaymentsForAdmin, updatePaymentStatus } from '../controllers/paymentController.js';

const router = express.Router();

// Route to create a new payment
router.post('/', createPayment);

// Route to get all payments by a specific user (user view)
router.get('/user/:user_id', getPaymentsByUser);
  

// Route to get all payments (admin view)
router.get('/admin', getAllPaymentsForAdmin);

// Add a new route to update payment status
router.put('/update-payment-status/:paymentId', updatePaymentStatus);

export default router;
