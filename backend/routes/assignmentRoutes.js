import express from 'express';
import {
  createAssignment,
  getAssignments,
  submitAssignment,
  getSubmissionsForAssignment,
  gradeSubmission,
} from '../controllers/assignmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('faculty'), upload.single('file'), createAssignment);
router.get('/', protect, getAssignments);
router.post('/:assignmentId/submit', protect, authorize('student'), upload.single('file'), submitAssignment);
router.get('/:assignmentId/submissions', protect, authorize('faculty'), getSubmissionsForAssignment);
router.post('/submissions/:submissionId/grade', protect, authorize('faculty'), gradeSubmission);

export default router;
