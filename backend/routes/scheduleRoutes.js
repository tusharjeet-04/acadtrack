import express from 'express';
import {
  getSchedules,
  createSchedule,
  deleteSchedule,
} from '../controllers/scheduleController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get schedules for logged-in user (all roles)
router.get('/', protect, getSchedules);

// Create new schedule slot (Admin and Faculty only)
router.post('/', protect, authorize('admin', 'faculty'), createSchedule);

// Delete schedule slot (Admin and Faculty only)
router.delete('/:id', protect, authorize('admin', 'faculty'), deleteSchedule);

export default router;
