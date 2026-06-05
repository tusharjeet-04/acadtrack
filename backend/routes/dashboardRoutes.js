import express from 'express';
import {
  getStudentDashboardStats,
  getFacultyDashboardStats,
  getAdminDashboardStats,
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/student', protect, authorize('student'), getStudentDashboardStats);
router.get('/faculty', protect, authorize('faculty'), getFacultyDashboardStats);
router.get('/admin', protect, authorize('admin'), getAdminDashboardStats);

export default router;
