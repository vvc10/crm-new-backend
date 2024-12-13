import express from 'express';
import {
  createQuery,
  fetchUserQueries,
  fetchAllQueries,
  fetchUserQueriesByStatus,
    fetchAllQueriesByStatus,
    updateQueryStatusByAdmin,
} from '../controllers/queryController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// User endpoints
router.post('/create', authenticateToken, createQuery);
router.get('/user', authenticateToken, fetchUserQueries);
router.get('/user/:status', authenticateToken, fetchUserQueriesByStatus); // New endpoint to get user queries by status

// Admin endpoints
router.get('/admin', authenticateToken, fetchAllQueries);
router.get('/admin/:status', authenticateToken, fetchAllQueriesByStatus); // New endpoint to get all queries by status
router.put('/admin/update-status', authenticateToken, updateQueryStatusByAdmin);

export default router;