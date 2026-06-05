import express from 'express';
import {
  markAttendance,
  getCourseAttendance,
  getStudentAttendanceSummary,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('faculty'), markAttendance);
router.get('/course/:courseId', protect, authorize('faculty', 'admin'), getCourseAttendance);
router.get('/student', protect, getStudentAttendanceSummary);
router.get('/student/:studentId', protect, authorize('faculty', 'admin'), getStudentAttendanceSummary);

export default router;
