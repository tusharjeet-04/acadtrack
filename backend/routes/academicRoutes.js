import express from 'express';
import {
  createCourse,
  getCourses,
  enrollStudent,
  addOrUpdateGrades,
  getAcademicRecords,
} from '../controllers/academicController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/courses', protect, authorize('admin'), createCourse);
router.get('/courses', protect, getCourses);
router.post('/courses/enroll', protect, authorize('admin'), enrollStudent);
router.post('/grades', protect, authorize('faculty'), addOrUpdateGrades);
router.get('/records', protect, getAcademicRecords);
router.get('/records/:studentId', protect, authorize('faculty', 'admin'), getAcademicRecords);

export default router;
