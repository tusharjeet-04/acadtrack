import express from 'express';
import {
  signupRequest,
  loginRequest,
  verifyOTP,
  getMe,
  getUsers,
  updateUser,
  deleteUser,
  forgotPasswordRequest,
  resetPassword,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// Temporary imports for cleanup
import User from '../models/User.js';
import Course from '../models/Course.js';
import AcademicRecord from '../models/AcademicRecord.js';
import Attendance from '../models/Attendance.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Notice from '../models/Notice.js';
import OTP from '../models/OTP.js';

const router = express.Router();

// Temporary cleanup endpoint — removes all students, faculty, and related data
router.get('/clear-users', async (req, res) => {
  try {
    // Delete all students and faculty (keep admin)
    await User.deleteMany({ role: { $in: ['student', 'faculty'] } });

    // Delete all related data
    await Course.deleteMany({});
    await AcademicRecord.deleteMany({});
    await Attendance.deleteMany({});
    await Assignment.deleteMany({});
    await Submission.deleteMany({});
    await Notice.deleteMany({});
    await OTP.deleteMany({});

    res.json({ message: 'All students, faculty, and related data cleared. Admin account preserved.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/signup-request', signupRequest);
router.post('/login-request', loginRequest);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', forgotPasswordRequest);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id', protect, authorize('admin'), updateUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

export default router;
