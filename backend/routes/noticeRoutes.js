import express from 'express';
import { createNotice, getNotices, deleteNotice } from '../controllers/noticeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('faculty', 'admin'), createNotice);
router.get('/', protect, getNotices);
router.delete('/:id', protect, authorize('faculty', 'admin'), deleteNotice);

export default router;
