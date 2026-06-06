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

// Temporary model imports for seeding
import User from '../models/User.js';
import Course from '../models/Course.js';
import AcademicRecord from '../models/AcademicRecord.js';
import Attendance from '../models/Attendance.js';
import Notice from '../models/Notice.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import OTP from '../models/OTP.js';

const router = express.Router();

// Temporary seed endpoint — will be removed after use
router.get('/seed-db', async (req, res) => {
  try {
    await User.deleteMany({});
    await Course.deleteMany({});
    await AcademicRecord.deleteMany({});
    await Attendance.deleteMany({});
    await Notice.deleteMany({});
    await Assignment.deleteMany({});
    await Submission.deleteMany({});
    await OTP.deleteMany({});

    const admin = await User.create({
      name: 'System Administrator',
      email: 'tusharjeetrout04@gmail.com',
      password: 'admin123',
      role: 'admin',
      department: 'Administration',
    });

    const faculty = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'faculty@acadtrack.com',
      password: 'faculty123',
      role: 'faculty',
      facultyId: 'F-2026-901',
      department: 'Computer Science',
    });

    const student1 = await User.create({
      name: 'John Doe',
      email: 'student@acadtrack.com',
      password: 'student123',
      role: 'student',
      studentId: 'S-2024-401',
      department: 'Computer Science',
      semester: 4,
    });

    const student2 = await User.create({
      name: 'Jane Smith',
      email: 'student2@acadtrack.com',
      password: 'student123',
      role: 'student',
      studentId: 'S-2024-402',
      department: 'Computer Science',
      semester: 4,
    });

    const course1 = await Course.create({
      name: 'Advanced Data Structures & Algorithms',
      code: 'CS401', credits: 4,
      department: 'Computer Science',
      faculty: faculty._id,
      studentsEnrolled: [student1._id, student2._id],
    });

    const course2 = await Course.create({
      name: 'Database Management Systems',
      code: 'CS402', credits: 3,
      department: 'Computer Science',
      faculty: faculty._id,
      studentsEnrolled: [student1._id, student2._id],
    });

    const course3 = await Course.create({
      name: 'Web Development Technologies',
      code: 'CS403', credits: 3,
      department: 'Computer Science',
      faculty: faculty._id,
      studentsEnrolled: [student1._id, student2._id],
    });

    const attendanceDates = ['2026-05-15','2026-05-18','2026-05-20','2026-05-22','2026-05-25'];

    for (let i = 0; i < attendanceDates.length; i++) {
      await Attendance.create({
        course: course1._id, date: new Date(attendanceDates[i]),
        records: [
          { student: student1._id, status: i === 4 ? 'Absent' : 'Present' },
          { student: student2._id, status: i === 1 ? 'Absent' : 'Present' },
        ],
      });
    }
    for (let i = 0; i < 4; i++) {
      await Attendance.create({
        course: course2._id, date: new Date(attendanceDates[i]),
        records: [
          { student: student1._id, status: 'Present' },
          { student: student2._id, status: i === 3 ? 'Absent' : 'Present' },
        ],
      });
      await Attendance.create({
        course: course3._id, date: new Date(attendanceDates[i]),
        records: [
          { student: student1._id, status: i === 3 ? 'Absent' : 'Present' },
          { student: student2._id, status: (i === 1 || i === 2) ? 'Absent' : 'Present' },
        ],
      });
    }

    await AcademicRecord.create({
      student: student1._id, semester: 3,
      courses: [
        { course: course1._id, marksObtained: 80, grade: 'A+', gradePoints: 9 },
        { course: course2._id, marksObtained: 72, grade: 'A', gradePoints: 8 },
      ],
      sgpa: 8.5, cgpa: 8.5,
    });
    await AcademicRecord.create({
      student: student1._id, semester: 4,
      courses: [
        { course: course1._id, marksObtained: 86, grade: 'A+', gradePoints: 9 },
        { course: course2._id, marksObtained: 92, grade: 'O', gradePoints: 10 },
        { course: course3._id, marksObtained: 78, grade: 'A', gradePoints: 8 },
      ],
      sgpa: 9.0, cgpa: 8.75,
    });
    await AcademicRecord.create({
      student: student2._id, semester: 4,
      courses: [
        { course: course1._id, marksObtained: 45, grade: 'C', gradePoints: 5 },
        { course: course2._id, marksObtained: 25, grade: 'F', gradePoints: 0 },
        { course: course3._id, marksObtained: 56, grade: 'B', gradePoints: 6 },
      ],
      sgpa: 3.8, cgpa: 3.8,
    });

    await Notice.create({ title: 'TCS Placement Drive 2026', content: 'TCS is organizing a campus recruitment drive for final year CS & IT students. Eligibility: CGPA >= 7.0, Attendance >= 75%, No active backlogs.', author: admin._id, targetRoles: ['student'] });
    await Notice.create({ title: 'Submission Deadline Extension - CS403', content: 'The deadline for Assignment 1 (React Core Principles) has been extended to June 15th, 2026.', author: faculty._id, targetRoles: ['student', 'faculty'] });
    await Notice.create({ title: 'Monthly Faculty Coordination Meeting', content: 'Monthly progress review meeting in the conference hall at 3:00 PM next Tuesday. Attendance is mandatory.', author: admin._id, targetRoles: ['faculty'] });

    const assignment1 = await Assignment.create({
      title: 'Assignment 1: Data Structure Complexities',
      description: 'Analyze time and space complexity of Red-Black Trees vs AVL Trees.',
      course: course1._id, dueDate: new Date('2026-06-20'), fileUrl: '/uploads/sample-assignment.pdf',
    });
    await Submission.create({ assignment: assignment1._id, student: student1._id, fileUrl: '/uploads/submission-johndoe.pdf', status: 'Submitted' });

    res.json({ message: 'Database seeded successfully! Admin: tusharjeetrout04@gmail.com / admin123' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/signup-request', signupRequest);
router.post('/login-request', loginRequest);
router.post('/verify-otp', verifyOTP);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id', protect, authorize('admin'), updateUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

export default router;
