import Schedule from '../models/Schedule.js';
import Course from '../models/Course.js';

// @desc    Get schedules based on user role
// @route   GET /api/schedule
// @access  Private
export const getSchedules = async (req, res) => {
  try {
    const role = req.user.role;
    let schedules = [];

    if (role === 'student') {
      // Find courses student is enrolled in
      const courses = await Course.find({ studentsEnrolled: req.user._id });
      const courseIds = courses.map((c) => c._id);

      // Find schedules for those courses
      schedules = await Schedule.find({ course: { $in: courseIds } })
        .populate({
          path: 'course',
          select: 'name code credits faculty',
          populate: {
            path: 'faculty',
            select: 'name email',
          },
        })
        .sort({ dayOfWeek: 1, startTime: 1 });
    } else if (role === 'faculty') {
      // Find courses faculty teaches
      const courses = await Course.find({ faculty: req.user._id });
      const courseIds = courses.map((c) => c._id);

      // Find schedules for those courses
      schedules = await Schedule.find({ course: { $in: courseIds } })
        .populate({
          path: 'course',
          select: 'name code credits studentsEnrolled',
        })
        .sort({ dayOfWeek: 1, startTime: 1 });
    } else if (role === 'admin') {
      // Admin sees everything
      schedules = await Schedule.find({})
        .populate({
          path: 'course',
          select: 'name code credits faculty studentsEnrolled',
          populate: {
            path: 'faculty',
            select: 'name email',
          },
        })
        .sort({ dayOfWeek: 1, startTime: 1 });
    } else {
      return res.status(403).json({ message: 'Invalid role' });
    }

    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new schedule slot
// @route   POST /api/schedule
// @access  Private (Admin, Faculty)
export const createSchedule = async (req, res) => {
  const { course: courseId, dayOfWeek, startTime, endTime, classroom } = req.body;

  try {
    // 1. Validate course exists
    const courseObj = await Course.findById(courseId);
    if (!courseObj) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // 2. Validate permissions
    // Faculty can only create schedule for courses they teach
    if (req.user.role === 'faculty' && courseObj.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized. You do not teach this course.' });
    }

    // 3. Time validation
    if (startTime >= endTime) {
      return res.status(400).json({ message: 'Start time must be before end time.' });
    }

    // 4. Overlap validation (same classroom, same day, overlapping hours)
    const existingSlots = await Schedule.find({ dayOfWeek, classroom });
    const hasOverlap = existingSlots.some((slot) => {
      return (
        (startTime >= slot.startTime && startTime < slot.endTime) ||
        (endTime > slot.startTime && endTime <= slot.endTime) ||
        (startTime <= slot.startTime && endTime >= slot.endTime)
      );
    });

    if (hasOverlap) {
      return res.status(400).json({ message: 'Time slot overlaps with an existing class in this classroom.' });
    }

    // 5. Create schedule slot
    const newSchedule = await Schedule.create({
      course: courseId,
      dayOfWeek,
      startTime,
      endTime,
      classroom,
    });

    // Populate course details for the response
    const populatedSchedule = await Schedule.findById(newSchedule._id).populate({
      path: 'course',
      select: 'name code credits faculty studentsEnrolled',
      populate: {
        path: 'faculty',
        select: 'name email',
      },
    });

    res.status(201).json(populatedSchedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a schedule slot
// @route   DELETE /api/schedule/:id
// @access  Private (Admin, Faculty)
export const deleteSchedule = async (req, res) => {
  const { id } = req.params;

  try {
    const schedule = await Schedule.findById(id).populate('course');
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule slot not found' });
    }

    // Validate permissions
    // Faculty can only delete schedules of courses they teach
    if (req.user.role === 'faculty' && schedule.course.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized. You do not teach this course.' });
    }

    await Schedule.findByIdAndDelete(id);
    res.status(200).json({ message: 'Schedule slot deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
