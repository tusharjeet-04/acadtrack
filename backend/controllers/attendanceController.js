import Attendance from '../models/Attendance.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// @desc    Mark daily attendance for a course
// @route   POST /api/attendance
// @access  Private (Faculty)
export const markAttendance = async (req, res) => {
  const { courseId, date, records } = req.body; // records: [{ student: id, status: 'Present'/'Absent' }]

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if faculty owns course
    if (course.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: You do not teach this course' });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setUTCHours(0, 0, 0, 0); // Normalize date

    // Check if attendance already marked for this date
    let attendance = await Attendance.findOne({ course: courseId, date: attendanceDate });

    if (attendance) {
      // Update existing records
      attendance.records = records;
      await attendance.save();
    } else {
      // Create new attendance record
      attendance = await Attendance.create({
        course: courseId,
        date: attendanceDate,
        records,
      });
    }

    res.status(200).json({ message: 'Attendance marked successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance history for a course
// @route   GET /api/attendance/course/:courseId
// @access  Private (Faculty)
export const getCourseAttendance = async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Verify ownership
    if (course.faculty.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const attendanceRecords = await Attendance.find({ course: courseId })
      .populate('records.student', 'name email studentId')
      .sort({ date: -1 });

    res.status(200).json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student attendance percentages for all courses
// @route   GET /api/attendance/student
// @access  Private (Student)
// @route   GET /api/attendance/student/:studentId
// @access  Private (Faculty, Admin)
export const getStudentAttendanceSummary = async (req, res) => {
  const studentId = req.params.studentId || req.user._id;

  try {
    // If student, check if they are accessing their own record
    if (req.user.role === 'student' && req.user._id.toString() !== studentId.toString()) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Find all courses where student is enrolled
    const courses = await Course.find({ studentsEnrolled: studentId });

    const summary = [];

    for (let course of courses) {
      // Find all marked attendance for this course
      const allAttendance = await Attendance.find({ course: course._id });

      let totalClasses = allAttendance.length;
      let presentCount = 0;

      allAttendance.forEach((att) => {
        const studentRecord = att.records.find(
          (rec) => rec.student.toString() === studentId.toString()
        );
        if (studentRecord && studentRecord.status === 'Present') {
          presentCount++;
        }
      });

      const percentage = totalClasses > 0 ? Number(((presentCount / totalClasses) * 100).toFixed(1)) : 100; // default 100% if no classes held

      summary.push({
        courseId: course._id,
        courseName: course.name,
        courseCode: course.code,
        presentCount,
        totalClasses,
        percentage,
      });
    }

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
