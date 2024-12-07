import express from 'express';
import { createPayment, getPaymentDetails, getAllPayments } from '../controllers/paymentController.js';

const router = express.Router();

// Payment routes
router.post('/create', createPayment);            // Create a new payment
router.get('/:transactionId', getPaymentDetails); // Get payment details by transaction ID
router.get('/', getAllPayments);                 // Get all payments

export default router;
