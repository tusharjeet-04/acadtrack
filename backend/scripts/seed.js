import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Course from '../models/Course.js';
import AcademicRecord from '../models/AcademicRecord.js';
import Attendance from '../models/Attendance.js';
import Notice from '../models/Notice.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import OTP from '../models/OTP.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Database for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Course.deleteMany({});
    await AcademicRecord.deleteMany({});
    await Attendance.deleteMany({});
    await Notice.deleteMany({});
    await Assignment.deleteMany({});
    await Submission.deleteMany({});
    await OTP.deleteMany({});
    console.log('Cleared all previous collections.');

    // 1. Create Users
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@acadtrack.com',
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

    console.log('Users created successfully.');

    // 2. Create Courses
    const course1 = await Course.create({
      name: 'Advanced Data Structures & Algorithms',
      code: 'CS401',
      credits: 4,
      department: 'Computer Science',
      faculty: faculty._id,
      studentsEnrolled: [student1._id, student2._id],
    });

    const course2 = await Course.create({
      name: 'Database Management Systems',
      code: 'CS402',
      credits: 3,
      department: 'Computer Science',
      faculty: faculty._id,
      studentsEnrolled: [student1._id, student2._id],
    });

    const course3 = await Course.create({
      name: 'Web Development Technologies',
      code: 'CS403',
      credits: 3,
      department: 'Computer Science',
      faculty: faculty._id,
      studentsEnrolled: [student1._id, student2._id],
    });

    console.log('Courses created successfully.');

    // 3. Populate Attendance Records
    const attendanceDates = [
      '2026-05-15',
      '2026-05-18',
      '2026-05-20',
      '2026-05-22',
      '2026-05-25',
    ];

    // Course 1 Attendance (5 classes)
    // Student 1: Present, Present, Present, Present, Absent (4/5 = 80%)
    // Student 2: Present, Absent, Present, Present, Present (4/5 = 80%)
    for (let i = 0; i < attendanceDates.length; i++) {
      await Attendance.create({
        course: course1._id,
        date: new Date(attendanceDates[i]),
        records: [
          { student: student1._id, status: i === 4 ? 'Absent' : 'Present' },
          { student: student2._id, status: i === 1 ? 'Absent' : 'Present' },
        ],
      });
    }

    // Course 2 Attendance (4 classes)
    // Student 1: Present, Present, Present, Present (4/4 = 100%)
    // Student 2: Present, Present, Present, Absent (3/4 = 75%)
    for (let i = 0; i < 4; i++) {
      await Attendance.create({
        course: course2._id,
        date: new Date(attendanceDates[i]),
        records: [
          { student: student1._id, status: 'Present' },
          { student: student2._id, status: i === 3 ? 'Absent' : 'Present' },
        ],
      });
    }

    // Course 3 Attendance (4 classes)
    // Student 1: Present, Present, Present, Absent (3/4 = 75%)
    // Student 2: Present, Absent, Absent, Present (2/4 = 50% - Ineligible)
    for (let i = 0; i < 4; i++) {
      await Attendance.create({
        course: course3._id,
        date: new Date(attendanceDates[i]),
        records: [
          { student: student1._id, status: i === 3 ? 'Absent' : 'Present' },
          { student: student2._id, status: (i === 1 || i === 2) ? 'Absent' : 'Present' },
        ],
      });
    }

    console.log('Attendance records created successfully.');

    // 4. Create Academic Records (Grades)
    // Student 1 Semester 3:
    // SGPA: 8.5
    await AcademicRecord.create({
      student: student1._id,
      semester: 3,
      courses: [
        { course: course1._id, marksObtained: 80, grade: 'A+', gradePoints: 9 },
        { course: course2._id, marksObtained: 72, grade: 'A', gradePoints: 8 },
      ],
      sgpa: 8.5,
      cgpa: 8.5,
    });

    // Student 1 Semester 4:
    // CS401 (4 credits): 86 -> A+ (9)
    // CS402 (3 credits): 92 -> O (10)
    // CS403 (3 credits): 78 -> A (8)
    // Weighted points: 9*4 + 10*3 + 8*3 = 36 + 30 + 24 = 90 / 10 = 9.0
    // CGPA: (8.5 + 9.0) / 2 = 8.75
    await AcademicRecord.create({
      student: student1._id,
      semester: 4,
      courses: [
        { course: course1._id, marksObtained: 86, grade: 'A+', gradePoints: 9 },
        { course: course2._id, marksObtained: 92, grade: 'O', gradePoints: 10 },
        { course: course3._id, marksObtained: 78, grade: 'A', gradePoints: 8 },
      ],
      sgpa: 9.0,
      cgpa: 8.75,
    });
    
    // Update semester 3 CGPA to match latest
    await AcademicRecord.updateOne(
      { student: student1._id, semester: 3 },
      { $set: { cgpa: 8.75 } }
    );

    // Student 2 Semester 4:
    // CS401 (4 credits): 45 -> C (5)
    // CS402 (3 credits): 25 -> F (0) - Backlog
    // CS403 (3 credits): 56 -> B (6)
    // Weighted points: 5*4 + 0*3 + 6*3 = 20 + 0 + 18 = 38 / 10 = 3.8
    // CGPA: 3.8
    await AcademicRecord.create({
      student: student2._id,
      semester: 4,
      courses: [
        { course: course1._id, marksObtained: 45, grade: 'C', gradePoints: 5 },
        { course: course2._id, marksObtained: 25, grade: 'F', gradePoints: 0 },
        { course: course3._id, marksObtained: 56, grade: 'B', gradePoints: 6 },
      ],
      sgpa: 3.8,
      cgpa: 3.8,
    });

    console.log('Academic records created successfully.');

    // 5. Notices
    await Notice.create({
      title: 'TCS Placement Drive 2026',
      content: 'Tata Consultancy Services is organizing a campus recruitment drive for final year CS & IT students. Eligibility requirements: CGPA >= 7.0, Attendance >= 75%, and No active backlogs. Make sure your AcadTrack profile is updated.',
      author: admin._id,
      targetRoles: ['student'],
    });

    await Notice.create({
      title: 'Submission Deadline Extension - CS403 Web Dev',
      content: 'The deadline for submitting Assignment 1 (React Core Principles) has been extended to June 15th, 2026. Submissions post the deadline will attract negative marks.',
      author: faculty._id,
      targetRoles: ['student', 'faculty'],
    });

    await Notice.create({
      title: 'Monthly Faculty Coordination Meeting',
      content: 'Dear faculty members, our monthly progress review and grading standard alignment meeting will take place in the conference hall at 3:00 PM next Tuesday. Attendance is mandatory.',
      author: admin._id,
      targetRoles: ['faculty'],
    });

    console.log('Notice board entries created successfully.');

    // 6. Assignments & Submissions
    const assignment1 = await Assignment.create({
      title: 'Assignment 1: Data Structure Complexities',
      description: 'Analyze the time and space complexity of Red-Black Trees vs AVL Trees. Submit a detailed PDF report.',
      course: course1._id,
      dueDate: new Date('2026-06-20'),
      fileUrl: '/uploads/sample-assignment.pdf',
    });

    // Student 1 submits
    await Submission.create({
      assignment: assignment1._id,
      student: student1._id,
      fileUrl: '/uploads/submission-johndoe.pdf',
      status: 'Submitted',
    });

    console.log('Assignments and submissions created successfully.');

    console.log('\n=================================================');
    console.log('DATABASE SEEDED SUCCESSFULLY!');
    console.log('Admin Email: admin@acadtrack.com (pw: admin123)');
    console.log('Faculty Email: faculty@acadtrack.com (pw: faculty123)');
    console.log('Student 1 Email (Eligible): student@acadtrack.com (pw: student123)');
    console.log('Student 2 Email (Ineligible): student2@acadtrack.com (pw: student123)');
    console.log('=================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
