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
import Schedule from '../models/Schedule.js';

dotenv.config();

// ─── Helper: attendance date windows per semester ────────────────────────────
const attendanceDates = {
  sem1: ['2026-01-06','2026-01-08','2026-01-10','2026-01-13','2026-01-15','2026-01-17'],
  sem2: ['2026-01-20','2026-01-22','2026-01-24','2026-01-27','2026-01-29','2026-01-31'],
  sem3: ['2026-02-03','2026-02-05','2026-02-07','2026-02-10','2026-02-12','2026-02-14'],
  sem4: ['2026-05-15','2026-05-18','2026-05-20','2026-05-22','2026-05-25','2026-05-27'],
  sem5: ['2026-02-17','2026-02-19','2026-02-21','2026-02-24','2026-02-26','2026-02-28'],
  sem6: ['2026-03-03','2026-03-05','2026-03-07','2026-03-10','2026-03-12','2026-03-14'],
};

// ─── Helper: grade from marks ────────────────────────────────────────────────
function gradeInfo(marks) {
  if (marks >= 90) return { grade: 'O',  gradePoints: 10 };
  if (marks >= 80) return { grade: 'A+', gradePoints: 9  };
  if (marks >= 70) return { grade: 'A',  gradePoints: 8  };
  if (marks >= 60) return { grade: 'B+', gradePoints: 7  };
  if (marks >= 55) return { grade: 'B',  gradePoints: 6  };
  if (marks >= 50) return { grade: 'C',  gradePoints: 5  };
  if (marks >= 40) return { grade: 'P',  gradePoints: 4  };
  return { grade: 'F', gradePoints: 0 };
}

// ─── Helper: compute SGPA ────────────────────────────────────────────────────
function calcSGPA(courseGrades, courseCreditMap) {
  let totalPoints = 0;
  let totalCredits = 0;
  for (const cg of courseGrades) {
    const credits = courseCreditMap[cg.course.toString()] || 3;
    totalPoints += cg.gradePoints * credits;
    totalCredits += credits;
  }
  return totalCredits ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;
}

// ─── Helper: bulk create attendance for a list of courses/student-patterns ──
async function seedAttendance(course, dates, studentPatterns) {
  for (let i = 0; i < dates.length; i++) {
    const records = studentPatterns.map(({ student, absents }) => ({
      student: student._id,
      status: absents.includes(i) ? 'Absent' : 'Present',
    }));
    await Attendance.create({
      course: course._id,
      date: new Date(dates[i]),
      records,
    });
  }
}

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Database for seeding...');

    // ── Clear all collections ───────────────────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      AcademicRecord.deleteMany({}),
      Attendance.deleteMany({}),
      Notice.deleteMany({}),
      Assignment.deleteMany({}),
      Submission.deleteMany({}),
      OTP.deleteMany({}),
      Schedule.deleteMany({}),
    ]);
    console.log('Cleared all previous collections.');

    // ════════════════════════════════════════════════════════════════════════
    // 1. USERS
    // ════════════════════════════════════════════════════════════════════════

    // Admin
    const admin = await User.create({
      name: 'System Administrator',
      email: 'tusharjeetrout04@gmail.com',
      password: 'admin123',
      role: 'admin',
      department: 'Administration',
    });

    // ── Faculty – Computer Science ──────────────────────────────────────────
    const fac_cs1 = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'faculty@acadtrack.com',
      password: 'faculty123',
      role: 'faculty',
      facultyId: 'F-2026-901',
      department: 'Computer Science',
    });

    const fac_cs2 = await User.create({
      name: 'Prof. Rajiv Sharma',
      email: 'rajiv.sharma@acadtrack.com',
      password: 'faculty123',
      role: 'faculty',
      facultyId: 'F-2026-902',
      department: 'Computer Science',
    });

    const fac_cs3 = await User.create({
      name: 'Dr. Priya Menon',
      email: 'priya.menon@acadtrack.com',
      password: 'faculty123',
      role: 'faculty',
      facultyId: 'F-2026-903',
      department: 'Computer Science',
    });

    // ── Faculty – Information Technology ───────────────────────────────────
    const fac_it1 = await User.create({
      name: 'Dr. Ankit Bose',
      email: 'ankit.bose@acadtrack.com',
      password: 'faculty123',
      role: 'faculty',
      facultyId: 'F-2026-904',
      department: 'Information Technology',
    });

    const fac_it2 = await User.create({
      name: 'Prof. Neha Kulkarni',
      email: 'neha.kulkarni@acadtrack.com',
      password: 'faculty123',
      role: 'faculty',
      facultyId: 'F-2026-905',
      department: 'Information Technology',
    });

    // ── Students – Computer Science ─────────────────────────────────────────
    // Sem 1
    const cs_s1a = await User.create({ name: 'Aarav Patel',    email: 'student@acadtrack.com',    password: 'student123', role: 'student', studentId: 'S-2026-101', department: 'Computer Science', semester: 1 });
    const cs_s1b = await User.create({ name: 'Riya Kapoor',    email: 'riya.kapoor@acadtrack.com',  password: 'student123', role: 'student', studentId: 'S-2026-102', department: 'Computer Science', semester: 1 });
    const cs_s1c = await User.create({ name: 'Ishaan Mehta',   email: 'ishaan.mehta@acadtrack.com', password: 'student123', role: 'student', studentId: 'S-2026-103', department: 'Computer Science', semester: 1 });

    // Sem 2
    const cs_s2a = await User.create({ name: 'Nisha Verma',    email: 'nisha.verma@acadtrack.com',  password: 'student123', role: 'student', studentId: 'S-2025-201', department: 'Computer Science', semester: 2 });
    const cs_s2b = await User.create({ name: 'Arjun Gupta',    email: 'arjun.gupta@acadtrack.com',  password: 'student123', role: 'student', studentId: 'S-2025-202', department: 'Computer Science', semester: 2 });
    const cs_s2c = await User.create({ name: 'Kavya Reddy',    email: 'kavya.reddy@acadtrack.com',  password: 'student123', role: 'student', studentId: 'S-2025-203', department: 'Computer Science', semester: 2 });

    // Sem 3
    const cs_s3a = await User.create({ name: 'Vikram Nair',    email: 'vikram.nair@acadtrack.com',  password: 'student123', role: 'student', studentId: 'S-2025-301', department: 'Computer Science', semester: 3 });
    const cs_s3b = await User.create({ name: 'Pooja Joshi',    email: 'pooja.joshi@acadtrack.com',  password: 'student123', role: 'student', studentId: 'S-2025-302', department: 'Computer Science', semester: 3 });
    const cs_s3c = await User.create({ name: 'Rahul Singh',    email: 'rahul.singh@acadtrack.com',  password: 'student123', role: 'student', studentId: 'S-2025-303', department: 'Computer Science', semester: 3 });

    // Sem 4 (original demo accounts kept)
    const cs_s4a = await User.create({ name: 'John Doe',       email: 'student2@acadtrack.com',     password: 'student123', role: 'student', studentId: 'S-2024-401', department: 'Computer Science', semester: 4 });
    const cs_s4b = await User.create({ name: 'Jane Smith',     email: 'jane.smith@acadtrack.com',   password: 'student123', role: 'student', studentId: 'S-2024-402', department: 'Computer Science', semester: 4 });
    const cs_s4c = await User.create({ name: 'Amit Tiwari',    email: 'amit.tiwari@acadtrack.com',  password: 'student123', role: 'student', studentId: 'S-2024-403', department: 'Computer Science', semester: 4 });

    // Sem 5
    const cs_s5a = await User.create({ name: 'Sneha Pillai',   email: 'sneha.pillai@acadtrack.com', password: 'student123', role: 'student', studentId: 'S-2024-501', department: 'Computer Science', semester: 5 });
    const cs_s5b = await User.create({ name: 'Devansh Roy',    email: 'devansh.roy@acadtrack.com',  password: 'student123', role: 'student', studentId: 'S-2024-502', department: 'Computer Science', semester: 5 });
    const cs_s5c = await User.create({ name: 'Meera Iyer',     email: 'meera.iyer@acadtrack.com',   password: 'student123', role: 'student', studentId: 'S-2024-503', department: 'Computer Science', semester: 5 });

    // Sem 6
    const cs_s6a = await User.create({ name: 'Karan Malhotra', email: 'karan.malhotra@acadtrack.com', password: 'student123', role: 'student', studentId: 'S-2023-601', department: 'Computer Science', semester: 6 });
    const cs_s6b = await User.create({ name: 'Divya Saxena',   email: 'divya.saxena@acadtrack.com',   password: 'student123', role: 'student', studentId: 'S-2023-602', department: 'Computer Science', semester: 6 });
    const cs_s6c = await User.create({ name: 'Harsh Aggarwal', email: 'harsh.aggarwal@acadtrack.com', password: 'student123', role: 'student', studentId: 'S-2023-603', department: 'Computer Science', semester: 6 });

    // ── Students – Information Technology ──────────────────────────────────
    // Sem 2
    const it_s2a = await User.create({ name: 'Tanvi Shah',     email: 'tanvi.shah@acadtrack.com',   password: 'student123', role: 'student', studentId: 'IT-2025-201', department: 'Information Technology', semester: 2 });
    const it_s2b = await User.create({ name: 'Rohan Khanna',   email: 'rohan.khanna@acadtrack.com', password: 'student123', role: 'student', studentId: 'IT-2025-202', department: 'Information Technology', semester: 2 });

    // Sem 4
    const it_s4a = await User.create({ name: 'Anjali Desai',   email: 'anjali.desai@acadtrack.com', password: 'student123', role: 'student', studentId: 'IT-2024-401', department: 'Information Technology', semester: 4 });
    const it_s4b = await User.create({ name: 'Nikhil Rao',     email: 'nikhil.rao@acadtrack.com',   password: 'student123', role: 'student', studentId: 'IT-2024-402', department: 'Information Technology', semester: 4 });

    // Sem 6
    const it_s6a = await User.create({ name: 'Preethi Nambiar',email: 'preethi.nambiar@acadtrack.com', password: 'student123', role: 'student', studentId: 'IT-2023-601', department: 'Information Technology', semester: 6 });
    const it_s6b = await User.create({ name: 'Sahil Jain',     email: 'sahil.jain@acadtrack.com',      password: 'student123', role: 'student', studentId: 'IT-2023-602', department: 'Information Technology', semester: 6 });

    console.log('Users created successfully.');

    // ════════════════════════════════════════════════════════════════════════
    // 2. COURSES
    // ════════════════════════════════════════════════════════════════════════

    // ── CS Semester 1 ───────────────────────────────────────────────────────
    const cs1_math = await Course.create({ name: 'Engineering Mathematics I',       code: 'CS101', credits: 4, department: 'Computer Science', faculty: fac_cs2._id, studentsEnrolled: [cs_s1a._id, cs_s1b._id, cs_s1c._id] });
    const cs1_prog = await Course.create({ name: 'Programming Fundamentals (C)',     code: 'CS102', credits: 3, department: 'Computer Science', faculty: fac_cs1._id, studentsEnrolled: [cs_s1a._id, cs_s1b._id, cs_s1c._id] });
    const cs1_phys = await Course.create({ name: 'Engineering Physics',              code: 'CS103', credits: 3, department: 'Computer Science', faculty: fac_cs3._id, studentsEnrolled: [cs_s1a._id, cs_s1b._id, cs_s1c._id] });

    // ── CS Semester 2 ───────────────────────────────────────────────────────
    const cs2_math = await Course.create({ name: 'Engineering Mathematics II',      code: 'CS201', credits: 4, department: 'Computer Science', faculty: fac_cs2._id, studentsEnrolled: [cs_s2a._id, cs_s2b._id, cs_s2c._id] });
    const cs2_ds   = await Course.create({ name: 'Data Structures',                 code: 'CS202', credits: 3, department: 'Computer Science', faculty: fac_cs1._id, studentsEnrolled: [cs_s2a._id, cs_s2b._id, cs_s2c._id] });
    const cs2_oop  = await Course.create({ name: 'Object Oriented Programming',     code: 'CS203', credits: 3, department: 'Computer Science', faculty: fac_cs3._id, studentsEnrolled: [cs_s2a._id, cs_s2b._id, cs_s2c._id] });

    // ── CS Semester 3 ───────────────────────────────────────────────────────
    const cs3_dsa  = await Course.create({ name: 'Design & Analysis of Algorithms', code: 'CS301', credits: 4, department: 'Computer Science', faculty: fac_cs1._id, studentsEnrolled: [cs_s3a._id, cs_s3b._id, cs_s3c._id] });
    const cs3_os   = await Course.create({ name: 'Operating Systems',               code: 'CS302', credits: 3, department: 'Computer Science', faculty: fac_cs2._id, studentsEnrolled: [cs_s3a._id, cs_s3b._id, cs_s3c._id] });
    const cs3_cn   = await Course.create({ name: 'Computer Networks',               code: 'CS303', credits: 3, department: 'Computer Science', faculty: fac_cs3._id, studentsEnrolled: [cs_s3a._id, cs_s3b._id, cs_s3c._id] });

    // ── CS Semester 4 ───────────────────────────────────────────────────────
    const cs4_ads  = await Course.create({ name: 'Advanced Data Structures & Algorithms', code: 'CS401', credits: 4, department: 'Computer Science', faculty: fac_cs1._id, studentsEnrolled: [cs_s4a._id, cs_s4b._id, cs_s4c._id] });
    const cs4_dbms = await Course.create({ name: 'Database Management Systems',      code: 'CS402', credits: 3, department: 'Computer Science', faculty: fac_cs2._id, studentsEnrolled: [cs_s4a._id, cs_s4b._id, cs_s4c._id] });
    const cs4_web  = await Course.create({ name: 'Web Development Technologies',     code: 'CS403', credits: 3, department: 'Computer Science', faculty: fac_cs3._id, studentsEnrolled: [cs_s4a._id, cs_s4b._id, cs_s4c._id] });

    // ── CS Semester 5 ───────────────────────────────────────────────────────
    const cs5_ml   = await Course.create({ name: 'Machine Learning',                code: 'CS501', credits: 4, department: 'Computer Science', faculty: fac_cs1._id, studentsEnrolled: [cs_s5a._id, cs_s5b._id, cs_s5c._id] });
    const cs5_cc   = await Course.create({ name: 'Cloud Computing',                 code: 'CS502', credits: 3, department: 'Computer Science', faculty: fac_cs2._id, studentsEnrolled: [cs_s5a._id, cs_s5b._id, cs_s5c._id] });
    const cs5_sec  = await Course.create({ name: 'Cyber Security & Cryptography',   code: 'CS503', credits: 3, department: 'Computer Science', faculty: fac_cs3._id, studentsEnrolled: [cs_s5a._id, cs_s5b._id, cs_s5c._id] });

    // ── CS Semester 6 ───────────────────────────────────────────────────────
    const cs6_ai   = await Course.create({ name: 'Artificial Intelligence',         code: 'CS601', credits: 4, department: 'Computer Science', faculty: fac_cs1._id, studentsEnrolled: [cs_s6a._id, cs_s6b._id, cs_s6c._id] });
    const cs6_big  = await Course.create({ name: 'Big Data Analytics',              code: 'CS602', credits: 3, department: 'Computer Science', faculty: fac_cs2._id, studentsEnrolled: [cs_s6a._id, cs_s6b._id, cs_s6c._id] });
    const cs6_se   = await Course.create({ name: 'Software Engineering',            code: 'CS603', credits: 3, department: 'Computer Science', faculty: fac_cs3._id, studentsEnrolled: [cs_s6a._id, cs_s6b._id, cs_s6c._id] });

    // ── IT Semester 2 ───────────────────────────────────────────────────────
    const it2_web  = await Course.create({ name: 'Web Technologies',                code: 'IT201', credits: 3, department: 'Information Technology', faculty: fac_it1._id, studentsEnrolled: [it_s2a._id, it_s2b._id] });
    const it2_db   = await Course.create({ name: 'Database Fundamentals',           code: 'IT202', credits: 3, department: 'Information Technology', faculty: fac_it2._id, studentsEnrolled: [it_s2a._id, it_s2b._id] });

    // ── IT Semester 4 ───────────────────────────────────────────────────────
    const it4_net  = await Course.create({ name: 'Network Administration',          code: 'IT401', credits: 3, department: 'Information Technology', faculty: fac_it1._id, studentsEnrolled: [it_s4a._id, it_s4b._id] });
    const it4_sys  = await Course.create({ name: 'System Analysis & Design',        code: 'IT402', credits: 3, department: 'Information Technology', faculty: fac_it2._id, studentsEnrolled: [it_s4a._id, it_s4b._id] });

    // ── IT Semester 6 ───────────────────────────────────────────────────────
    const it6_mob  = await Course.create({ name: 'Mobile Application Development',  code: 'IT601', credits: 4, department: 'Information Technology', faculty: fac_it1._id, studentsEnrolled: [it_s6a._id, it_s6b._id] });
    const it6_iot  = await Course.create({ name: 'Internet of Things',              code: 'IT602', credits: 3, department: 'Information Technology', faculty: fac_it2._id, studentsEnrolled: [it_s6a._id, it_s6b._id] });

    console.log('Courses created successfully.');

    // ════════════════════════════════════════════════════════════════════════
    // 3. ATTENDANCE
    // ════════════════════════════════════════════════════════════════════════

    // CS Sem 1
    await seedAttendance(cs1_math, attendanceDates.sem1, [
      { student: cs_s1a, absents: [] },
      { student: cs_s1b, absents: [2] },
      { student: cs_s1c, absents: [4, 5] },
    ]);
    await seedAttendance(cs1_prog, attendanceDates.sem1, [
      { student: cs_s1a, absents: [1] },
      { student: cs_s1b, absents: [] },
      { student: cs_s1c, absents: [3] },
    ]);
    await seedAttendance(cs1_phys, attendanceDates.sem1, [
      { student: cs_s1a, absents: [5] },
      { student: cs_s1b, absents: [0, 4] },
      { student: cs_s1c, absents: [] },
    ]);

    // CS Sem 2
    await seedAttendance(cs2_math, attendanceDates.sem2, [
      { student: cs_s2a, absents: [0] },
      { student: cs_s2b, absents: [3, 5] },
      { student: cs_s2c, absents: [] },
    ]);
    await seedAttendance(cs2_ds, attendanceDates.sem2, [
      { student: cs_s2a, absents: [] },
      { student: cs_s2b, absents: [1] },
      { student: cs_s2c, absents: [2, 4] },
    ]);
    await seedAttendance(cs2_oop, attendanceDates.sem2, [
      { student: cs_s2a, absents: [4] },
      { student: cs_s2b, absents: [] },
      { student: cs_s2c, absents: [0, 1, 5] },   // low attendance
    ]);

    // CS Sem 3
    await seedAttendance(cs3_dsa, attendanceDates.sem3, [
      { student: cs_s3a, absents: [] },
      { student: cs_s3b, absents: [2] },
      { student: cs_s3c, absents: [1, 5] },
    ]);
    await seedAttendance(cs3_os, attendanceDates.sem3, [
      { student: cs_s3a, absents: [3] },
      { student: cs_s3b, absents: [] },
      { student: cs_s3c, absents: [0, 2] },
    ]);
    await seedAttendance(cs3_cn, attendanceDates.sem3, [
      { student: cs_s3a, absents: [5] },
      { student: cs_s3b, absents: [0, 3] },
      { student: cs_s3c, absents: [] },
    ]);

    // CS Sem 4
    await seedAttendance(cs4_ads, attendanceDates.sem4, [
      { student: cs_s4a, absents: [5] },
      { student: cs_s4b, absents: [1] },
      { student: cs_s4c, absents: [0, 3] },
    ]);
    await seedAttendance(cs4_dbms, attendanceDates.sem4, [
      { student: cs_s4a, absents: [] },
      { student: cs_s4b, absents: [3] },
      { student: cs_s4c, absents: [4, 5] },
    ]);
    await seedAttendance(cs4_web, attendanceDates.sem4, [
      { student: cs_s4a, absents: [3] },
      { student: cs_s4b, absents: [1, 2] },  // borderline 66%
      { student: cs_s4c, absents: [] },
    ]);

    // CS Sem 5
    await seedAttendance(cs5_ml, attendanceDates.sem5, [
      { student: cs_s5a, absents: [] },
      { student: cs_s5b, absents: [0, 4] },
      { student: cs_s5c, absents: [2] },
    ]);
    await seedAttendance(cs5_cc, attendanceDates.sem5, [
      { student: cs_s5a, absents: [1] },
      { student: cs_s5b, absents: [] },
      { student: cs_s5c, absents: [0, 5] },
    ]);
    await seedAttendance(cs5_sec, attendanceDates.sem5, [
      { student: cs_s5a, absents: [3] },
      { student: cs_s5b, absents: [2, 5] },
      { student: cs_s5c, absents: [] },
    ]);

    // CS Sem 6
    await seedAttendance(cs6_ai, attendanceDates.sem6, [
      { student: cs_s6a, absents: [] },
      { student: cs_s6b, absents: [1, 4] },
      { student: cs_s6c, absents: [3] },
    ]);
    await seedAttendance(cs6_big, attendanceDates.sem6, [
      { student: cs_s6a, absents: [5] },
      { student: cs_s6b, absents: [] },
      { student: cs_s6c, absents: [0, 2, 5] },  // low
    ]);
    await seedAttendance(cs6_se, attendanceDates.sem6, [
      { student: cs_s6a, absents: [2] },
      { student: cs_s6b, absents: [4] },
      { student: cs_s6c, absents: [] },
    ]);

    // IT Sem 2
    await seedAttendance(it2_web, attendanceDates.sem2, [
      { student: it_s2a, absents: [0] },
      { student: it_s2b, absents: [3, 5] },
    ]);
    await seedAttendance(it2_db, attendanceDates.sem2, [
      { student: it_s2a, absents: [] },
      { student: it_s2b, absents: [1] },
    ]);

    // IT Sem 4
    await seedAttendance(it4_net, attendanceDates.sem4, [
      { student: it_s4a, absents: [2] },
      { student: it_s4b, absents: [] },
    ]);
    await seedAttendance(it4_sys, attendanceDates.sem4, [
      { student: it_s4a, absents: [] },
      { student: it_s4b, absents: [4] },
    ]);

    // IT Sem 6
    await seedAttendance(it6_mob, attendanceDates.sem6, [
      { student: it_s6a, absents: [] },
      { student: it_s6b, absents: [0, 3] },
    ]);
    await seedAttendance(it6_iot, attendanceDates.sem6, [
      { student: it_s6a, absents: [5] },
      { student: it_s6b, absents: [] },
    ]);

    console.log('Attendance records created successfully.');

    // ════════════════════════════════════════════════════════════════════════
    // 4. ACADEMIC RECORDS
    // ════════════════════════════════════════════════════════════════════════

    // Credit lookup
    const creditMap = {
      [cs1_math._id]: 4, [cs1_prog._id]: 3, [cs1_phys._id]: 3,
      [cs2_math._id]: 4, [cs2_ds._id]:   3, [cs2_oop._id]:  3,
      [cs3_dsa._id]:  4, [cs3_os._id]:   3, [cs3_cn._id]:   3,
      [cs4_ads._id]:  4, [cs4_dbms._id]: 3, [cs4_web._id]:  3,
      [cs5_ml._id]:   4, [cs5_cc._id]:   3, [cs5_sec._id]:  3,
      [cs6_ai._id]:   4, [cs6_big._id]:  3, [cs6_se._id]:   3,
      [it2_web._id]:  3, [it2_db._id]:   3,
      [it4_net._id]:  3, [it4_sys._id]:  3,
      [it6_mob._id]:  4, [it6_iot._id]:  3,
    };

    // Helper to create a course-grade entry
    function cg(course, marks) {
      const { grade, gradePoints } = gradeInfo(marks);
      return { course: course._id, marksObtained: marks, grade, gradePoints };
    }

    // ── CS Sem 1 students ───────────────────────────────────────────────────
    const cs1a_s1_courses = [cg(cs1_math,88), cg(cs1_prog,92), cg(cs1_phys,76)];
    const cs1a_s1_sgpa = calcSGPA(cs1a_s1_courses, creditMap);
    await AcademicRecord.create({ student: cs_s1a._id, semester: 1, courses: cs1a_s1_courses, sgpa: cs1a_s1_sgpa, cgpa: cs1a_s1_sgpa });

    const cs1b_s1_courses = [cg(cs1_math,74), cg(cs1_prog,68), cg(cs1_phys,81)];
    const cs1b_s1_sgpa = calcSGPA(cs1b_s1_courses, creditMap);
    await AcademicRecord.create({ student: cs_s1b._id, semester: 1, courses: cs1b_s1_courses, sgpa: cs1b_s1_sgpa, cgpa: cs1b_s1_sgpa });

    const cs1c_s1_courses = [cg(cs1_math,55), cg(cs1_prog,62), cg(cs1_phys,48)];
    const cs1c_s1_sgpa = calcSGPA(cs1c_s1_courses, creditMap);
    await AcademicRecord.create({ student: cs_s1c._id, semester: 1, courses: cs1c_s1_courses, sgpa: cs1c_s1_sgpa, cgpa: cs1c_s1_sgpa });

    // ── CS Sem 2 students ───────────────────────────────────────────────────
    const cs2a_prev_cgpa = 8.8;
    const cs2a_s2_courses = [cg(cs2_math,91), cg(cs2_ds,87), cg(cs2_oop,93)];
    const cs2a_s2_sgpa = calcSGPA(cs2a_s2_courses, creditMap);
    const cs2a_cgpa = parseFloat(((cs2a_prev_cgpa + cs2a_s2_sgpa) / 2).toFixed(2));
    await AcademicRecord.create({ student: cs_s2a._id, semester: 2, courses: cs2a_s2_courses, sgpa: cs2a_s2_sgpa, cgpa: cs2a_cgpa });

    const cs2b_prev_cgpa = 7.2;
    const cs2b_s2_courses = [cg(cs2_math,65), cg(cs2_ds,71), cg(cs2_oop,58)];
    const cs2b_s2_sgpa = calcSGPA(cs2b_s2_courses, creditMap);
    const cs2b_cgpa = parseFloat(((cs2b_prev_cgpa + cs2b_s2_sgpa) / 2).toFixed(2));
    await AcademicRecord.create({ student: cs_s2b._id, semester: 2, courses: cs2b_s2_courses, sgpa: cs2b_s2_sgpa, cgpa: cs2b_cgpa });

    const cs2c_prev_cgpa = 5.5;
    const cs2c_s2_courses = [cg(cs2_math,42), cg(cs2_ds,38), cg(cs2_oop,51)];
    const cs2c_s2_sgpa = calcSGPA(cs2c_s2_courses, creditMap);
    const cs2c_cgpa = parseFloat(((cs2c_prev_cgpa + cs2c_s2_sgpa) / 2).toFixed(2));
    await AcademicRecord.create({ student: cs_s2c._id, semester: 2, courses: cs2c_s2_courses, sgpa: cs2c_s2_sgpa, cgpa: cs2c_cgpa });

    // ── CS Sem 3 students ───────────────────────────────────────────────────
    const cs3a_prev_cgpa = 9.1;
    const cs3a_s3_courses = [cg(cs3_dsa,95), cg(cs3_os,88), cg(cs3_cn,90)];
    const cs3a_s3_sgpa = calcSGPA(cs3a_s3_courses, creditMap);
    const cs3a_cgpa = parseFloat(((cs3a_prev_cgpa + cs3a_s3_sgpa) / 2).toFixed(2));
    await AcademicRecord.create({ student: cs_s3a._id, semester: 3, courses: cs3a_s3_courses, sgpa: cs3a_s3_sgpa, cgpa: cs3a_cgpa });

    const cs3b_prev_cgpa = 7.8;
    const cs3b_s3_courses = [cg(cs3_dsa,73), cg(cs3_os,80), cg(cs3_cn,69)];
    const cs3b_s3_sgpa = calcSGPA(cs3b_s3_courses, creditMap);
    const cs3b_cgpa = parseFloat(((cs3b_prev_cgpa + cs3b_s3_sgpa) / 2).toFixed(2));
    await AcademicRecord.create({ student: cs_s3b._id, semester: 3, courses: cs3b_s3_courses, sgpa: cs3b_s3_sgpa, cgpa: cs3b_cgpa });

    const cs3c_prev_cgpa = 6.0;
    const cs3c_s3_courses = [cg(cs3_dsa,58), cg(cs3_os,45), cg(cs3_cn,62)];
    const cs3c_s3_sgpa = calcSGPA(cs3c_s3_courses, creditMap);
    const cs3c_cgpa = parseFloat(((cs3c_prev_cgpa + cs3c_s3_sgpa) / 2).toFixed(2));
    await AcademicRecord.create({ student: cs_s3c._id, semester: 3, courses: cs3c_s3_courses, sgpa: cs3c_s3_sgpa, cgpa: cs3c_cgpa });

    // ── CS Sem 4 students ───────────────────────────────────────────────────
    // John Doe (cs_s4a) - high performer
    const s4a_s3 = [cg(cs4_ads,85), cg(cs4_dbms,92), cg(cs4_web,78)];
    const s4a_s3_sgpa = calcSGPA(s4a_s3, creditMap);
    await AcademicRecord.create({ student: cs_s4a._id, semester: 3, courses: s4a_s3, sgpa: 8.5, cgpa: 8.5 });
    const s4a_s4 = [cg(cs4_ads,86), cg(cs4_dbms,92), cg(cs4_web,78)];
    const s4a_s4_sgpa = calcSGPA(s4a_s4, creditMap);
    const s4a_cgpa = parseFloat(((8.5 + s4a_s4_sgpa) / 2).toFixed(2));
    await AcademicRecord.create({ student: cs_s4a._id, semester: 4, courses: s4a_s4, sgpa: s4a_s4_sgpa, cgpa: s4a_cgpa });
    await AcademicRecord.updateOne({ student: cs_s4a._id, semester: 3 }, { $set: { cgpa: s4a_cgpa } });

    // Jane Smith (cs_s4b) - struggling with backlog
    await AcademicRecord.create({ student: cs_s4b._id, semester: 3, courses: [cg(cs4_ads,52), cg(cs4_dbms,47), cg(cs4_web,55)], sgpa: 5.4, cgpa: 5.4 });
    const s4b_s4 = [cg(cs4_ads,45), cg(cs4_dbms,25), cg(cs4_web,56)];
    const s4b_s4_sgpa = calcSGPA(s4b_s4, creditMap);
    const s4b_cgpa = parseFloat(((5.4 + s4b_s4_sgpa) / 2).toFixed(2));
    await AcademicRecord.create({ student: cs_s4b._id, semester: 4, courses: s4b_s4, sgpa: s4b_s4_sgpa, cgpa: s4b_cgpa });
    await AcademicRecord.updateOne({ student: cs_s4b._id, semester: 3 }, { $set: { cgpa: s4b_cgpa } });

    // Amit Tiwari (cs_s4c) - average
    await AcademicRecord.create({ student: cs_s4c._id, semester: 3, courses: [cg(cs4_ads,70), cg(cs4_dbms,68), cg(cs4_web,72)], sgpa: 7.2, cgpa: 7.2 });
    const s4c_s4 = [cg(cs4_ads,75), cg(cs4_dbms,71), cg(cs4_web,79)];
    const s4c_s4_sgpa = calcSGPA(s4c_s4, creditMap);
    const s4c_cgpa = parseFloat(((7.2 + s4c_s4_sgpa) / 2).toFixed(2));
    await AcademicRecord.create({ student: cs_s4c._id, semester: 4, courses: s4c_s4, sgpa: s4c_s4_sgpa, cgpa: s4c_cgpa });
    await AcademicRecord.updateOne({ student: cs_s4c._id, semester: 3 }, { $set: { cgpa: s4c_cgpa } });

    // ── CS Sem 5 students ───────────────────────────────────────────────────
    const cs5a_prev_cgpa = 9.2;
    const cs5a_s5_courses = [cg(cs5_ml,94), cg(cs5_cc,88), cg(cs5_sec,91)];
    const cs5a_s5_sgpa = calcSGPA(cs5a_s5_courses, creditMap);
    const cs5a_cgpa = parseFloat(((cs5a_prev_cgpa + cs5a_s5_sgpa) / 2).toFixed(2));
    await AcademicRecord.create({ student: cs_s5a._id, semester: 5, courses: cs5a_s5_courses, sgpa: cs5a_s5_sgpa, cgpa: cs5a_cgpa });

    const cs5b_prev_cgpa = 7.0;
    const cs5b_s5_courses = [cg(cs5_ml,66), cg(cs5_cc,71), cg(cs5_sec,63)];
    const cs5b_s5_sgpa = calcSGPA(cs5b_s5_courses, creditMap);
    const cs5b_cgpa = parseFloat(((cs5b_prev_cgpa + cs5b_s5_sgpa) / 2).toFixed(2));
    await AcademicRecord.create({ student: cs_s5b._id, semester: 5, courses: cs5b_s5_courses, sgpa: cs5b_s5_sgpa, cgpa: cs5b_cgpa });

    const cs5c_prev_cgpa = 8.1;
    const cs5c_s5_courses = [cg(cs5_ml,82), cg(cs5_cc,77), cg(cs5_sec,85)];
    const cs5c_s5_sgpa = calcSGPA(cs5c_s5_courses, creditMap);
    const cs5c_cgpa = parseFloat(((cs5c_prev_cgpa + cs5c_s5_sgpa) / 2).toFixed(2));
    await AcademicRecord.create({ student: cs_s5c._id, semester: 5, courses: cs5c_s5_courses, sgpa: cs5c_s5_sgpa, cgpa: cs5c_cgpa });

    // ── CS Sem 6 students ───────────────────────────────────────────────────
    const cs6a_prev_cgpa = 8.9;
    const cs6a_s6_courses = [cg(cs6_ai,96), cg(cs6_big,89), cg(cs6_se,92)];
    const cs6a_s6_sgpa = calcSGPA(cs6a_s6_courses, creditMap);
    const cs6a_cgpa = parseFloat(((cs6a_prev_cgpa + cs6a_s6_sgpa) / 2).toFixed(2));
    await AcademicRecord.create({ student: cs_s6a._id, semester: 6, courses: cs6a_s6_courses, sgpa: cs6a_s6_sgpa, cgpa: cs6a_cgpa });

    const cs6b_prev_cgpa = 7.5;
    const cs6b_s6_courses = [cg(cs6_ai,74), cg(cs6_big,80), cg(cs6_se,68)];
    const cs6b_s6_sgpa = calcSGPA(cs6b_s6_courses, creditMap);
    const cs6b_cgpa = parseFloat(((cs6b_prev_cgpa + cs6b_s6_sgpa) / 2).toFixed(2));
    await AcademicRecord.create({ student: cs_s6b._id, semester: 6, courses: cs6b_s6_courses, sgpa: cs6b_s6_sgpa, cgpa: cs6b_cgpa });

    const cs6c_prev_cgpa = 5.8;
    const cs6c_s6_courses = [cg(cs6_ai,52), cg(cs6_big,35), cg(cs6_se,60)];
    const cs6c_s6_sgpa = calcSGPA(cs6c_s6_courses, creditMap);
    const cs6c_cgpa = parseFloat(((cs6c_prev_cgpa + cs6c_s6_sgpa) / 2).toFixed(2));
    await AcademicRecord.create({ student: cs_s6c._id, semester: 6, courses: cs6c_s6_courses, sgpa: cs6c_s6_sgpa, cgpa: cs6c_cgpa });

    // ── IT Sem 2 students ───────────────────────────────────────────────────
    const it2a_s2_courses = [cg(it2_web,83), cg(it2_db,79)];
    const it2a_s2_sgpa = calcSGPA(it2a_s2_courses, creditMap);
    await AcademicRecord.create({ student: it_s2a._id, semester: 2, courses: it2a_s2_courses, sgpa: it2a_s2_sgpa, cgpa: it2a_s2_sgpa });

    const it2b_s2_courses = [cg(it2_web,61), cg(it2_db,55)];
    const it2b_s2_sgpa = calcSGPA(it2b_s2_courses, creditMap);
    await AcademicRecord.create({ student: it_s2b._id, semester: 2, courses: it2b_s2_courses, sgpa: it2b_s2_sgpa, cgpa: it2b_s2_sgpa });

    // ── IT Sem 4 students ───────────────────────────────────────────────────
    const it4a_prev_cgpa = 8.0;
    const it4a_s4_courses = [cg(it4_net,85), cg(it4_sys,88)];
    const it4a_s4_sgpa = calcSGPA(it4a_s4_courses, creditMap);
    const it4a_cgpa = parseFloat(((it4a_prev_cgpa + it4a_s4_sgpa) / 2).toFixed(2));
    await AcademicRecord.create({ student: it_s4a._id, semester: 4, courses: it4a_s4_courses, sgpa: it4a_s4_sgpa, cgpa: it4a_cgpa });

    const it4b_prev_cgpa = 6.5;
    const it4b_s4_courses = [cg(it4_net,58), cg(it4_sys,65)];
    const it4b_s4_sgpa = calcSGPA(it4b_s4_courses, creditMap);
    const it4b_cgpa = parseFloat(((it4b_prev_cgpa + it4b_s4_sgpa) / 2).toFixed(2));
    await AcademicRecord.create({ student: it_s4b._id, semester: 4, courses: it4b_s4_courses, sgpa: it4b_s4_sgpa, cgpa: it4b_cgpa });

    // ── IT Sem 6 students ───────────────────────────────────────────────────
    const it6a_prev_cgpa = 8.4;
    const it6a_s6_courses = [cg(it6_mob,90), cg(it6_iot,86)];
    const it6a_s6_sgpa = calcSGPA(it6a_s6_courses, creditMap);
    const it6a_cgpa = parseFloat(((it6a_prev_cgpa + it6a_s6_sgpa) / 2).toFixed(2));
    await AcademicRecord.create({ student: it_s6a._id, semester: 6, courses: it6a_s6_courses, sgpa: it6a_s6_sgpa, cgpa: it6a_cgpa });

    const it6b_prev_cgpa = 7.1;
    const it6b_s6_courses = [cg(it6_mob,72), cg(it6_iot,66)];
    const it6b_s6_sgpa = calcSGPA(it6b_s6_courses, creditMap);
    const it6b_cgpa = parseFloat(((it6b_prev_cgpa + it6b_s6_sgpa) / 2).toFixed(2));
    await AcademicRecord.create({ student: it_s6b._id, semester: 6, courses: it6b_s6_courses, sgpa: it6b_s6_sgpa, cgpa: it6b_cgpa });

    console.log('Academic records created successfully.');

    // ════════════════════════════════════════════════════════════════════════
    // 5. NOTICES
    // ════════════════════════════════════════════════════════════════════════

    await Notice.create({
      title: 'TCS Placement Drive 2026',
      content: 'Tata Consultancy Services is organizing a campus recruitment drive for final-year CS & IT students. Eligibility: CGPA ≥ 7.0, Attendance ≥ 75%, No active backlogs. Ensure your AcadTrack profile is updated before applying.',
      author: admin._id,
      targetRoles: ['student'],
    });

    await Notice.create({
      title: 'Infosys InfyTQ Certification Drive',
      content: 'All 5th and 6th semester students are encouraged to complete the Infosys InfyTQ Foundation certification. The college will reimburse exam fees for students scoring above 80%. Register through the placement portal.',
      author: admin._id,
      targetRoles: ['student'],
    });

    await Notice.create({
      title: 'Assignment Deadline Extension – CS403 Web Dev',
      content: 'The deadline for submitting Assignment 1 (React Core Principles) in CS403 has been extended to June 20th, 2026. Late submissions will incur a 10% penalty per day.',
      author: fac_cs3._id,
      targetRoles: ['student', 'faculty'],
    });

    await Notice.create({
      title: 'Mid-Semester Examination Schedule',
      content: 'Mid-semester exams for all departments will be held from July 10–18, 2026. Timetables have been uploaded to the student portal. Students with attendance below 75% will require HOD approval to appear.',
      author: admin._id,
      targetRoles: ['student', 'faculty'],
    });

    await Notice.create({
      title: 'Monthly Faculty Coordination Meeting',
      content: 'Dear faculty, the monthly progress review and grading alignment meeting will be held in the Conference Hall (Block A) at 3:00 PM next Tuesday. Attendance is mandatory. Please bring the current semester grade sheets.',
      author: admin._id,
      targetRoles: ['faculty'],
    });

    await Notice.create({
      title: 'Research Paper Submission – IEEE Conference',
      content: 'Faculty members are invited to submit research papers for the upcoming IEEE International Conference on Computing & AI (ICCA-2026). Deadline: July 31, 2026. College will provide funding support for accepted papers.',
      author: admin._id,
      targetRoles: ['faculty'],
    });

    await Notice.create({
      title: 'ML Project Showcase – Semester 5',
      content: 'All Semester 5 CS students enrolled in CS501 must present their ML Mini-Projects on June 28, 2026. Projects must include a working demo and a written report. Faculty evaluators will be from both CS and IT departments.',
      author: fac_cs1._id,
      targetRoles: ['student'],
    });

    console.log('Notice board entries created successfully.');

    // ════════════════════════════════════════════════════════════════════════
    // 6. ASSIGNMENTS & SUBMISSIONS
    // ════════════════════════════════════════════════════════════════════════

    // CS Sem 1
    const asgn_cs1_prog = await Assignment.create({
      title: 'Assignment 1: Pattern Printing in C',
      description: 'Write C programs to print various number and star patterns. Submit a single .c file with all patterns implemented as separate functions.',
      course: cs1_prog._id,
      dueDate: new Date('2026-06-25'),
      fileUrl: '/uploads/assignments/cs102_a1.pdf',
    });
    await Submission.create({ assignment: asgn_cs1_prog._id, student: cs_s1a._id, fileUrl: '/uploads/submissions/aarav_cs102_a1.c', status: 'Graded', grade: 'A+', feedback: 'Excellent work, all patterns implemented correctly.' });
    await Submission.create({ assignment: asgn_cs1_prog._id, student: cs_s1b._id, fileUrl: '/uploads/submissions/riya_cs102_a1.c',  status: 'Graded', grade: 'B',  feedback: 'Good attempt, minor issues in diamond pattern.' });

    // CS Sem 2
    const asgn_cs2_ds = await Assignment.create({
      title: 'Assignment 1: Linked List Implementation',
      description: 'Implement singly and doubly linked lists with insert, delete, reverse, and search operations in C++. Submit source file and a report.',
      course: cs2_ds._id,
      dueDate: new Date('2026-06-28'),
      fileUrl: '/uploads/assignments/cs202_a1.pdf',
    });
    await Submission.create({ assignment: asgn_cs2_ds._id, student: cs_s2a._id, fileUrl: '/uploads/submissions/nisha_cs202_a1.cpp', status: 'Graded', grade: 'O',  feedback: 'Perfect implementation with edge case handling.' });
    await Submission.create({ assignment: asgn_cs2_ds._id, student: cs_s2b._id, fileUrl: '/uploads/submissions/arjun_cs202_a1.cpp', status: 'Submitted' });

    // CS Sem 3
    const asgn_cs3_os = await Assignment.create({
      title: 'Assignment 1: CPU Scheduling Simulation',
      description: 'Simulate FCFS, SJF, and Round Robin CPU scheduling algorithms. Compare average turnaround time and waiting time. Submit a Python/C program and analysis report.',
      course: cs3_os._id,
      dueDate: new Date('2026-07-01'),
      fileUrl: '/uploads/assignments/cs302_a1.pdf',
    });
    await Submission.create({ assignment: asgn_cs3_os._id, student: cs_s3a._id, fileUrl: '/uploads/submissions/vikram_cs302_a1.py', status: 'Graded', grade: 'A+', feedback: 'Excellent simulation with clear comparison charts.' });
    await Submission.create({ assignment: asgn_cs3_os._id, student: cs_s3b._id, fileUrl: '/uploads/submissions/pooja_cs302_a1.py',  status: 'Graded', grade: 'A',  feedback: 'Good work, Gantt charts well-drawn.' });
    await Submission.create({ assignment: asgn_cs3_os._id, student: cs_s3c._id, fileUrl: '/uploads/submissions/rahul_cs302_a1.py',  status: 'Submitted' });

    // CS Sem 4
    const asgn_cs4_ads = await Assignment.create({
      title: 'Assignment 1: Data Structure Complexities',
      description: 'Analyze the time and space complexity of Red-Black Trees vs AVL Trees. Submit a detailed PDF report with benchmarks.',
      course: cs4_ads._id,
      dueDate: new Date('2026-06-20'),
      fileUrl: '/uploads/assignments/cs401_a1.pdf',
    });
    await Submission.create({ assignment: asgn_cs4_ads._id, student: cs_s4a._id, fileUrl: '/uploads/submissions/john_cs401_a1.pdf',  status: 'Graded', grade: 'A+', feedback: 'Thorough analysis with well-structured comparisons.' });
    await Submission.create({ assignment: asgn_cs4_ads._id, student: cs_s4c._id, fileUrl: '/uploads/submissions/amit_cs401_a1.pdf',  status: 'Submitted' });

    const asgn_cs4_web = await Assignment.create({
      title: 'Assignment 1: React Core Principles',
      description: 'Build a small React application demonstrating component lifecycle, hooks, and state management. Deploy on Vercel and submit the GitHub repository link.',
      course: cs4_web._id,
      dueDate: new Date('2026-06-20'),
      fileUrl: '/uploads/assignments/cs403_a1.pdf',
    });
    await Submission.create({ assignment: asgn_cs4_web._id, student: cs_s4a._id, fileUrl: '/uploads/submissions/john_cs403_a1.pdf', status: 'Graded', grade: 'O', feedback: 'Outstanding app with clean code and good deployment.' });
    await Submission.create({ assignment: asgn_cs4_web._id, student: cs_s4b._id, fileUrl: '/uploads/submissions/jane_cs403_a1.pdf', status: 'Submitted' });

    // CS Sem 5
    const asgn_cs5_ml = await Assignment.create({
      title: 'Assignment 1: Linear Regression from Scratch',
      description: 'Implement linear regression using gradient descent in Python (NumPy only, no sklearn). Apply it on the Boston Housing dataset. Submit Jupyter Notebook.',
      course: cs5_ml._id,
      dueDate: new Date('2026-07-05'),
      fileUrl: '/uploads/assignments/cs501_a1.pdf',
    });
    await Submission.create({ assignment: asgn_cs5_ml._id, student: cs_s5a._id, fileUrl: '/uploads/submissions/sneha_cs501_a1.ipynb', status: 'Graded', grade: 'O',  feedback: 'Excellent implementation with proper loss curve visualisation.' });
    await Submission.create({ assignment: asgn_cs5_ml._id, student: cs_s5b._id, fileUrl: '/uploads/submissions/devansh_cs501_a1.ipynb', status: 'Submitted' });
    await Submission.create({ assignment: asgn_cs5_ml._id, student: cs_s5c._id, fileUrl: '/uploads/submissions/meera_cs501_a1.ipynb', status: 'Graded', grade: 'A', feedback: 'Good work, consider adding cross-validation.' });

    // CS Sem 6
    const asgn_cs6_ai = await Assignment.create({
      title: 'Assignment 1: A* Pathfinding Visualiser',
      description: 'Implement the A* search algorithm and build an interactive grid-based visualiser using Pygame or React. Compare performance against BFS and Dijkstra.',
      course: cs6_ai._id,
      dueDate: new Date('2026-07-10'),
      fileUrl: '/uploads/assignments/cs601_a1.pdf',
    });
    await Submission.create({ assignment: asgn_cs6_ai._id, student: cs_s6a._id, fileUrl: '/uploads/submissions/karan_cs601_a1.zip', status: 'Graded', grade: 'O',  feedback: 'Beautiful visualiser with accurate heuristic. Excellent work.' });
    await Submission.create({ assignment: asgn_cs6_ai._id, student: cs_s6b._id, fileUrl: '/uploads/submissions/divya_cs601_a1.zip', status: 'Submitted' });

    // IT Sem 4
    const asgn_it4_net = await Assignment.create({
      title: 'Assignment 1: Subnet Mask Calculator',
      description: 'Build a network tool (CLI or GUI) that calculates subnet masks, broadcast address, and host range given an IP and prefix length. Submit source code.',
      course: it4_net._id,
      dueDate: new Date('2026-07-08'),
      fileUrl: '/uploads/assignments/it401_a1.pdf',
    });
    await Submission.create({ assignment: asgn_it4_net._id, student: it_s4a._id, fileUrl: '/uploads/submissions/anjali_it401_a1.py', status: 'Graded', grade: 'A+', feedback: 'Well-built tool with a clean GUI. Great work.' });

    // IT Sem 6
    const asgn_it6_mob = await Assignment.create({
      title: 'Assignment 1: Flutter Todo App',
      description: 'Build a fully functional Todo application in Flutter with local persistence using SQLite (sqflite package). Must include add, edit, delete, and filter functionality.',
      course: it6_mob._id,
      dueDate: new Date('2026-07-12'),
      fileUrl: '/uploads/assignments/it601_a1.pdf',
    });
    await Submission.create({ assignment: asgn_it6_mob._id, student: it_s6a._id, fileUrl: '/uploads/submissions/preethi_it601_a1.zip', status: 'Graded', grade: 'A+', feedback: 'Clean UI, proper state management, and SQLite integration. Excellent.' });
    await Submission.create({ assignment: asgn_it6_mob._id, student: it_s6b._id, fileUrl: '/uploads/submissions/sahil_it601_a1.zip',  status: 'Submitted' });

    console.log('Assignments and submissions created successfully.');

    // ════════════════════════════════════════════════════════════════════════
    // 7. CLASS SCHEDULES
    // ════════════════════════════════════════════════════════════════════════

    const schedules = [
      // CS Sem 1
      { course: cs1_math._id, dayOfWeek: 'Monday',    startTime: '08:00', endTime: '09:30', classroom: 'LHC-101' },
      { course: cs1_prog._id, dayOfWeek: 'Monday',    startTime: '10:00', endTime: '11:30', classroom: 'Lab-1'   },
      { course: cs1_phys._id, dayOfWeek: 'Tuesday',   startTime: '09:00', endTime: '10:30', classroom: 'LHC-103' },
      { course: cs1_math._id, dayOfWeek: 'Wednesday', startTime: '08:00', endTime: '09:30', classroom: 'LHC-101' },
      { course: cs1_prog._id, dayOfWeek: 'Thursday',  startTime: '10:00', endTime: '11:30', classroom: 'Lab-1'   },
      { course: cs1_phys._id, dayOfWeek: 'Friday',    startTime: '09:00', endTime: '10:30', classroom: 'LHC-103' },

      // CS Sem 2
      { course: cs2_math._id, dayOfWeek: 'Monday',    startTime: '11:00', endTime: '12:30', classroom: 'LHC-102' },
      { course: cs2_ds._id,   dayOfWeek: 'Tuesday',   startTime: '11:00', endTime: '12:30', classroom: 'Lab-2'   },
      { course: cs2_oop._id,  dayOfWeek: 'Wednesday', startTime: '13:00', endTime: '14:30', classroom: 'LHC-104' },
      { course: cs2_math._id, dayOfWeek: 'Thursday',  startTime: '11:00', endTime: '12:30', classroom: 'LHC-102' },
      { course: cs2_ds._id,   dayOfWeek: 'Friday',    startTime: '11:00', endTime: '12:30', classroom: 'Lab-2'   },

      // CS Sem 3
      { course: cs3_dsa._id,  dayOfWeek: 'Monday',    startTime: '09:00', endTime: '10:30', classroom: 'LHC-201' },
      { course: cs3_os._id,   dayOfWeek: 'Tuesday',   startTime: '13:00', endTime: '14:30', classroom: 'LHC-202' },
      { course: cs3_cn._id,   dayOfWeek: 'Wednesday', startTime: '10:00', endTime: '11:30', classroom: 'LHC-203' },
      { course: cs3_dsa._id,  dayOfWeek: 'Friday',    startTime: '09:00', endTime: '10:30', classroom: 'LHC-201' },

      // CS Sem 4
      { course: cs4_ads._id,  dayOfWeek: 'Monday',    startTime: '09:00', endTime: '10:30', classroom: 'LHC-301' },
      { course: cs4_dbms._id, dayOfWeek: 'Monday',    startTime: '11:00', endTime: '12:30', classroom: 'LHC-302' },
      { course: cs4_ads._id,  dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '10:30', classroom: 'LHC-301' },
      { course: cs4_web._id,  dayOfWeek: 'Wednesday', startTime: '14:00', endTime: '15:30', classroom: 'Lab-3'   },
      { course: cs4_dbms._id, dayOfWeek: 'Friday',    startTime: '11:00', endTime: '12:30', classroom: 'LHC-302' },
      { course: cs4_web._id,  dayOfWeek: 'Friday',    startTime: '14:00', endTime: '15:30', classroom: 'Lab-3'   },

      // CS Sem 5
      { course: cs5_ml._id,   dayOfWeek: 'Monday',    startTime: '09:00', endTime: '10:30', classroom: 'LHC-401' },
      { course: cs5_cc._id,   dayOfWeek: 'Tuesday',   startTime: '11:00', endTime: '12:30', classroom: 'Lab-4'   },
      { course: cs5_sec._id,  dayOfWeek: 'Thursday',  startTime: '14:00', endTime: '15:30', classroom: 'LHC-402' },
      { course: cs5_ml._id,   dayOfWeek: 'Friday',    startTime: '09:00', endTime: '10:30', classroom: 'LHC-401' },

      // CS Sem 6
      { course: cs6_ai._id,   dayOfWeek: 'Monday',    startTime: '10:00', endTime: '11:30', classroom: 'LHC-501' },
      { course: cs6_big._id,  dayOfWeek: 'Wednesday', startTime: '13:00', endTime: '14:30', classroom: 'Lab-5'   },
      { course: cs6_se._id,   dayOfWeek: 'Friday',    startTime: '11:00', endTime: '12:30', classroom: 'LHC-502' },

      // IT Sem 2
      { course: it2_web._id,  dayOfWeek: 'Tuesday',   startTime: '09:00', endTime: '10:30', classroom: 'IT-Lab-1' },
      { course: it2_db._id,   dayOfWeek: 'Thursday',  startTime: '11:00', endTime: '12:30', classroom: 'IT-201'   },

      // IT Sem 4
      { course: it4_net._id,  dayOfWeek: 'Monday',    startTime: '13:00', endTime: '14:30', classroom: 'IT-Lab-2' },
      { course: it4_sys._id,  dayOfWeek: 'Wednesday', startTime: '11:00', endTime: '12:30', classroom: 'IT-301'   },

      // IT Sem 6
      { course: it6_mob._id,  dayOfWeek: 'Tuesday',   startTime: '14:00', endTime: '15:30', classroom: 'IT-Lab-3' },
      { course: it6_iot._id,  dayOfWeek: 'Thursday',  startTime: '09:00', endTime: '10:30', classroom: 'IT-401'   },
    ];

    await Schedule.insertMany(schedules);
    console.log('Schedule records created successfully.');

    // ════════════════════════════════════════════════════════════════════════
    // SUMMARY
    // ════════════════════════════════════════════════════════════════════════
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║              DATABASE SEEDED SUCCESSFULLY!                   ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  ADMIN                                                       ║');
    console.log('║    tusharjeetrout04@gmail.com   (pw: admin123)               ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  FACULTY – Computer Science                                  ║');
    console.log('║    faculty@acadtrack.com        Dr. Sarah Jenkins (Sem 1–6)  ║');
    console.log('║    rajiv.sharma@acadtrack.com   Prof. Rajiv Sharma (Sem 1–6) ║');
    console.log('║    priya.menon@acadtrack.com    Dr. Priya Menon   (Sem 1–6)  ║');
    console.log('║  FACULTY – Information Technology                            ║');
    console.log('║    ankit.bose@acadtrack.com     Dr. Ankit Bose    (Sem 2,4,6)║');
    console.log('║    neha.kulkarni@acadtrack.com  Prof. Neha Kulkarni(Sem2,4,6)║');
    console.log('║  (All faculty passwords: faculty123)                         ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  STUDENTS – Computer Science (password: student123)          ║');
    console.log('║  Sem 1: student@acadtrack.com (Aarav), riya.kapoor,          ║');
    console.log('║         ishaan.mehta                                         ║');
    console.log('║  Sem 2: nisha.verma, arjun.gupta, kavya.reddy                ║');
    console.log('║  Sem 3: vikram.nair, pooja.joshi, rahul.singh                ║');
    console.log('║  Sem 4: student2@acadtrack.com (John Doe), jane.smith,       ║');
    console.log('║         amit.tiwari                                          ║');
    console.log('║  Sem 5: sneha.pillai, devansh.roy, meera.iyer                ║');
    console.log('║  Sem 6: karan.malhotra, divya.saxena, harsh.aggarwal         ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║  STUDENTS – Information Technology (password: student123)    ║');
    console.log('║  Sem 2: tanvi.shah, rohan.khanna                             ║');
    console.log('║  Sem 4: anjali.desai, nikhil.rao                             ║');
    console.log('║  Sem 6: preethi.nambiar, sahil.jain                          ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
