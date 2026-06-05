import express from 'express';
import {
  signupRequest,
  loginRequest,
  verifyOTP,
  getMe,
  getUsers,
  updateUser,
  deleteUser,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup-request', signupRequest);
router.post('/login-request', loginRequest);
router.post('/verify-otp', verifyOTP);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id', protect, authorize('admin'), updateUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

export default router;
