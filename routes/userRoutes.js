import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all users
router.get('/', authenticateToken, getAllUsers);

// Get a user by ID
router.get('/:id', authenticateToken, getUserById);

// Update a user
router.put('/:id', authenticateToken, updateUser);

// Delete a user
router.delete('/:id', authenticateToken, deleteUser);

export default router;