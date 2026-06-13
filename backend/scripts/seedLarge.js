import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Course from '../models/Course.js';
import AcademicRecord from '../models/AcademicRecord.js';
import Attendance from '../models/Attendance.js';
import Notice from '../models/Notice.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import OTP from '../models/OTP.js';

// Force Node to use Google DNS so SRV lookups succeed on Windows
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();


// ─── Helpers ──────────────────────────────────────────────────────────────────

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];

function marksToGrade(marks) {
  if (marks >= 90) return { grade: 'O', gradePoints: 10 };
  if (marks >= 80) return { grade: 'A+', gradePoints: 9 };
  if (marks >= 70) return { grade: 'A', gradePoints: 8 };
  if (marks >= 60) return { grade: 'B+', gradePoints: 7 };
  if (marks >= 50) return { grade: 'B', gradePoints: 6 };
  if (marks >= 40) return { grade: 'C', gradePoints: 5 };
  if (marks >= 35) return { grade: 'P', gradePoints: 4 };
  return { grade: 'F', gradePoints: 0 };
}

function calcSGPA(courseEntries, courseMap) {
  let totalPoints = 0;
  let totalCredits = 0;
  for (const entry of courseEntries) {
    const credits = courseMap[entry.course.toString()]?.credits ?? 3;
    totalPoints += entry.gradePoints * credits;
    totalCredits += credits;
  }
  return totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const departments = [
  'Computer Science',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
];

const firstNames = [
  'Aarav','Aditya','Akash','Ananya','Arjun','Aryan','Ayaan','Bhavya','Chinmay','Deepak',
  'Dhruv','Divya','Farhan','Gaurav','Harshit','Ishaan','Jatin','Kavya','Kiran','Kriti',
  'Lakshmi','Manav','Meera','Mihir','Nandini','Nikhil','Nisha','Om','Pallavi','Parth',
  'Prachi','Priya','Rahul','Raj','Rajat','Riya','Rohan','Sana','Sanjay','Sara',
  'Shivam','Shruti','Siddharth','Simran','Sneha','Soham','Sonali','Suresh','Tanvi','Tarun',
  'Uday','Ujjwal','Varun','Vedant','Vikram','Vineeta','Vishal','Yash','Zara','Zoha',
  'Abhishek','Aditi','Ajay','Akanksha','Alok','Amisha','Amrit','Ankita','Ankit','Anuj',
  'Arpita','Ashish','Avni','Ayushi','Bharat','Charu','Chirag','Daksh','Devika','Dinesh',
  'Esha','Gaurav','Girish','Harini','Heena','Hitesh','Isha','Jaya','Kamal','Karan',
  'Khushi','Komal','Lalit','Lavanya','Lokesh','Madhav','Mahesh','Manisha','Manoj','Mayank',
];

const lastNames = [
  'Sharma','Verma','Gupta','Singh','Kumar','Patel','Joshi','Rao','Mehta','Shah',
  'Nair','Pillai','Mishra','Tiwari','Srivastava','Choudhary','Pandey','Agarwal','Malhotra','Kapoor',
];

const facultyTitles = ['Dr.', 'Prof.', 'Mr.', 'Ms.'];

const courseDefinitions = [
  // CS courses
  { name: 'Data Structures & Algorithms', code: 'CS301', credits: 4, dept: 'Computer Science' },
  { name: 'Database Management Systems', code: 'CS302', credits: 3, dept: 'Computer Science' },
  { name: 'Operating Systems', code: 'CS303', credits: 4, dept: 'Computer Science' },
  { name: 'Computer Networks', code: 'CS401', credits: 3, dept: 'Computer Science' },
  { name: 'Web Development Technologies', code: 'CS402', credits: 3, dept: 'Computer Science' },
  { name: 'Software Engineering', code: 'CS403', credits: 3, dept: 'Computer Science' },
  { name: 'Artificial Intelligence', code: 'CS501', credits: 4, dept: 'Computer Science' },
  { name: 'Machine Learning', code: 'CS502', credits: 4, dept: 'Computer Science' },
  // IT courses
  { name: 'Information Security', code: 'IT301', credits: 3, dept: 'Information Technology' },
  { name: 'Cloud Computing', code: 'IT302', credits: 3, dept: 'Information Technology' },
  { name: 'Mobile Application Development', code: 'IT401', credits: 3, dept: 'Information Technology' },
  { name: 'DevOps & CI/CD', code: 'IT402', credits: 3, dept: 'Information Technology' },
  // ECE courses
  { name: 'Digital Electronics', code: 'EC301', credits: 4, dept: 'Electronics & Communication' },
  { name: 'Signal Processing', code: 'EC302', credits: 3, dept: 'Electronics & Communication' },
  { name: 'VLSI Design', code: 'EC401', credits: 4, dept: 'Electronics & Communication' },
  { name: 'Embedded Systems', code: 'EC402', credits: 3, dept: 'Electronics & Communication' },
  // Mechanical courses
  { name: 'Thermodynamics', code: 'ME301', credits: 4, dept: 'Mechanical Engineering' },
  { name: 'Fluid Mechanics', code: 'ME302', credits: 3, dept: 'Mechanical Engineering' },
  { name: 'Manufacturing Processes', code: 'ME401', credits: 3, dept: 'Mechanical Engineering' },
  // Civil courses
  { name: 'Structural Analysis', code: 'CE301', credits: 4, dept: 'Civil Engineering' },
  { name: 'Geotechnical Engineering', code: 'CE302', credits: 3, dept: 'Civil Engineering' },
  { name: 'Environmental Engineering', code: 'CE401', credits: 3, dept: 'Civil Engineering' },
];

const noticesData = [
  {
    title: 'TCS Campus Placement Drive 2026',
    content: 'Tata Consultancy Services is organizing a campus recruitment drive for final year students. Eligibility: CGPA >= 7.0, No active backlogs. Register at the placement portal before June 20th.',
    roles: ['student'],
  },
  {
    title: 'End Semester Examination Schedule Released',
    content: 'The timetable for End Semester Examinations has been released on the college portal. Students are advised to download their hall tickets at least 3 days before the exam.',
    roles: ['student', 'faculty'],
  },
  {
    title: 'Faculty Development Program – AI & ML',
    content: 'A 5-day FDP on Artificial Intelligence and Machine Learning will be conducted from July 10–14, 2026. All faculty members are encouraged to apply through the administration portal.',
    roles: ['faculty'],
  },
  {
    title: 'Sports Day 2026 – Registration Open',
    content: 'The annual Sports Day will be held on July 5, 2026. Students can register for various events including cricket, football, badminton, and athletics. Last date to register: June 25, 2026.',
    roles: ['student'],
  },
  {
    title: 'Library Membership Renewal',
    content: 'All students must renew their library membership for the academic year 2026–27. Bring your ID card and fee receipt to the library office between 10 AM – 4 PM on working days.',
    roles: ['student', 'faculty', 'admin'],
  },
  {
    title: 'Monthly Faculty Coordination Meeting',
    content: 'The monthly faculty coordination and grading alignment meeting will take place in Conference Hall B at 3:00 PM next Tuesday. Attendance is mandatory for all HODs and faculty representatives.',
    roles: ['faculty'],
  },
  {
    title: 'Infosys InfyTQ Certification Drive',
    content: 'Infosys is inviting pre-final year students to appear for the InfyTQ certification. Students clearing the test will get a direct fast-track interview opportunity. Register at infytq.onlinetest.in.',
    roles: ['student'],
  },
  {
    title: 'Anti-Ragging Policy Reminder',
    content: 'The institution reaffirms its zero-tolerance policy towards ragging. Any incident must be reported immediately to the Anti-Ragging Committee or via the helpline: 1800-180-5522.',
    roles: ['student', 'faculty', 'admin'],
  },
  {
    title: 'Fee Payment Deadline – Semester 5',
    content: 'The last date for paying Semester 5 tuition fees without a fine is June 30, 2026. A late fee of ₹500/day will be charged thereafter. Contact accounts office for any queries.',
    roles: ['student'],
  },
  {
    title: 'Research Grant Applications Open',
    content: 'The DST-SERB research grant applications for the 2026–27 cycle are now open. Interested faculty members can submit proposals through the research cell office by July 15, 2026.',
    roles: ['faculty'],
  },
];

// ─── Main Seed Function ───────────────────────────────────────────────────────

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅  Connected to MongoDB Atlas for large seed...');

    // Clear all existing data
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      AcademicRecord.deleteMany({}),
      Attendance.deleteMany({}),
      Notice.deleteMany({}),
      Assignment.deleteMany({}),
      Submission.deleteMany({}),
      OTP.deleteMany({}),
    ]);
    console.log('🗑️   Cleared all existing collections.');

    // ── 1. Admin ─────────────────────────────────────────────────────────────
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@acadtrack.com',
      password: 'admin123',
      role: 'admin',
      department: 'Administration',
    });
    console.log('👤  Admin created.');

    // ── 2. Faculty (20) ──────────────────────────────────────────────────────
    const usedEmails = new Set(['admin@acadtrack.com']);
    const usedFacultyIds = new Set();

    const facultyRecords = [];
    let fCount = 0;
    while (fCount < 5) {
      const fName = `${pick(facultyTitles)} ${firstNames[fCount % firstNames.length]} ${lastNames[fCount % lastNames.length]}`;
      const baseEmail = `faculty${fCount + 1}@acadtrack.com`;
      if (usedEmails.has(baseEmail)) { fCount++; continue; }
      usedEmails.add(baseEmail);

      const fId = `F-2026-${900 + fCount + 1}`;
      if (usedFacultyIds.has(fId)) { fCount++; continue; }
      usedFacultyIds.add(fId);

      const dept = departments[fCount % departments.length];
      facultyRecords.push({
        name: fName,
        email: baseEmail,
        password: 'faculty123',
        role: 'faculty',
        facultyId: fId,
        department: dept,
      });
      fCount++;
    }

    const createdFaculty = await User.insertMany(facultyRecords);
    console.log(`👩‍🏫  ${createdFaculty.length} faculty members created.`);

    // ── 3. Students (100) ────────────────────────────────────────────────────
    const usedStudentIds = new Set();
    const studentRecords = [];
    let sCount = 0;
    while (sCount < 50) {
      const sName = `${firstNames[sCount % firstNames.length]} ${lastNames[sCount % lastNames.length]}`;
      const baseEmail = sCount === 0
        ? 'student@acadtrack.com'   // keep original demo login working
        : `student${sCount + 1}@acadtrack.com`;

      if (usedEmails.has(baseEmail)) { sCount++; continue; }
      usedEmails.add(baseEmail);

      const sId = `S-2024-${100 + sCount + 1}`;
      if (usedStudentIds.has(sId)) { sCount++; continue; }
      usedStudentIds.add(sId);

      const dept = departments[sCount % departments.length];
      const sem = rand(1, 8);
      studentRecords.push({
        name: sName,
        email: baseEmail,
        password: 'student123',
        role: 'student',
        studentId: sId,
        department: dept,
        semester: sem,
      });
      sCount++;
    }

    const createdStudents = await User.insertMany(studentRecords);
    console.log(`🎓  ${createdStudents.length} students created.`);

    // ── 4. Courses (22) ──────────────────────────────────────────────────────
    // Map department → faculty list for assignment
    const facultyByDept = {};
    for (const f of createdFaculty) {
      if (!facultyByDept[f.department]) facultyByDept[f.department] = [];
      facultyByDept[f.department].push(f._id);
    }

    // Map department → student list for enrollment
    const studentsByDept = {};
    for (const s of createdStudents) {
      if (!studentsByDept[s.department]) studentsByDept[s.department] = [];
      studentsByDept[s.department].push(s._id);
    }

    // Fill any missing dept faculty with a fallback
    const allFacultyIds = createdFaculty.map((f) => f._id);
    for (const dept of departments) {
      if (!facultyByDept[dept] || facultyByDept[dept].length === 0) {
        facultyByDept[dept] = [allFacultyIds[0]];
      }
    }

    const createdCourses = [];
    for (const cd of courseDefinitions) {
      const deptFaculty = facultyByDept[cd.dept] ?? allFacultyIds;
      const assignedFaculty = pick(deptFaculty);

      // Enroll students of same dept; if none exist, fall back to first 10 students
      const deptStudents = studentsByDept[cd.dept] ?? createdStudents.slice(0, 10).map((s) => s._id);
      // Enroll between 8 and all dept students
      const enrollCount = Math.min(deptStudents.length, rand(8, deptStudents.length));
      const shuffled = [...deptStudents].sort(() => Math.random() - 0.5).slice(0, enrollCount);

      const course = await Course.create({
        name: cd.name,
        code: cd.code,
        credits: cd.credits,
        department: cd.dept,
        faculty: assignedFaculty,
        studentsEnrolled: shuffled,
      });
      createdCourses.push(course);
    }
    console.log(`📚  ${createdCourses.length} courses created.`);

    // Build courseId → credits map for SGPA calculation
    const courseMap = {};
    for (const c of createdCourses) {
      courseMap[c._id.toString()] = { credits: c.credits, dept: c.department };
    }

    // ── 5. Attendance (for each course over 20 class dates) ──────────────────
    // Generate 20 class dates (Mon/Wed/Fri pattern) starting from 2026-02-02
    const classDates = [];
    let d = new Date('2026-02-02');
    while (classDates.length < 20) {
      const day = d.getDay(); // 0=Sun, 1=Mon ...
      if (day === 1 || day === 3 || day === 5) {
        classDates.push(new Date(d));
      }
      d.setDate(d.getDate() + 1);
    }

    for (const course of createdCourses) {
      const enrolled = course.studentsEnrolled;
      for (const classDate of classDates) {
        const records = enrolled.map((sid) => ({
          student: sid,
          // 80% chance present, adjusted so some students dip below 75%
          status: Math.random() < 0.82 ? 'Present' : 'Absent',
        }));
        await Attendance.create({ course: course._id, date: classDate, records });
      }
    }
    console.log(`📅  Attendance records created for all courses (20 classes each).`);

    // ── 6. Academic Records ──────────────────────────────────────────────────
    // For each student, generate records for their enrolled courses by semester
    // Group courses by semester buckets: sem 1-2 → foundational, sem 3-4 → core, etc.
    // We'll just create 1–2 academic record semesters per student with their dept courses

    const academicRecordsInserted = [];
    for (const student of createdStudents) {
      // Find courses this student is enrolled in
      const enrolledCourses = createdCourses.filter((c) =>
        c.studentsEnrolled.some((sid) => sid.equals(student._id))
      );
      if (enrolledCourses.length === 0) continue;

      const currentSem = student.semester;
      // Previous semester record (if sem > 1)
      const prevSem = currentSem > 1 ? currentSem - 1 : null;

      const semestersToCreate = prevSem ? [prevSem, currentSem] : [currentSem];
      let runningCGPASum = 0;

      for (let i = 0; i < semestersToCreate.length; i++) {
        const sem = semestersToCreate[i];
        // Pick 3–4 courses for this semester record
        const semCourses = enrolledCourses.slice(0, Math.min(enrolledCourses.length, rand(3, 4)));
        const courseEntries = semCourses.map((c) => {
          const marks = rand(30, 98);
          const { grade, gradePoints } = marksToGrade(marks);
          return { course: c._id, marksObtained: marks, grade, gradePoints };
        });

        const sgpa = calcSGPA(courseEntries, courseMap);
        runningCGPASum += sgpa;
        const cgpa = parseFloat((runningCGPASum / (i + 1)).toFixed(2));

        academicRecordsInserted.push({
          student: student._id,
          semester: sem,
          courses: courseEntries,
          sgpa,
          cgpa,
        });
      }
    }

    // insertMany with ordered: false to skip duplicates gracefully
    try {
      await AcademicRecord.insertMany(academicRecordsInserted, { ordered: false });
    } catch (e) {
      // ignore duplicate key errors (compound index student+semester)
      if (e.code !== 11000) throw e;
    }
    console.log(`📊  Academic records inserted.`);

    // ── 7. Notices (10) ──────────────────────────────────────────────────────
    for (const n of noticesData) {
      const authorIsAdmin = n.roles.includes('admin') || !n.roles.includes('faculty');
      await Notice.create({
        title: n.title,
        content: n.content,
        author: authorIsAdmin ? admin._id : pick(createdFaculty)._id,
        targetRoles: n.roles,
      });
    }
    console.log(`📢  ${noticesData.length} notices created.`);

    // ── 8. Assignments & Submissions ─────────────────────────────────────────
    const assignmentTemplates = [
      { title: 'Assignment 1: Complexity Analysis Report', desc: 'Analyze time and space complexity of BFS vs DFS. Submit a detailed PDF.' },
      { title: 'Assignment 2: ER Diagram Submission', desc: 'Design an ER diagram for a library management system and normalize to 3NF.' },
      { title: 'Mini Project: REST API Development', desc: 'Build a fully functional CRUD REST API using Node.js and Express. Include Postman collection.' },
      { title: 'Case Study: Network Topology Comparison', desc: 'Compare star, mesh, and ring topologies. Document advantages, disadvantages, and use-cases.' },
      { title: 'Lab Report: OS Scheduling Algorithms', desc: 'Implement and compare FCFS, SJF, and Round Robin scheduling. Submit code + analysis.' },
    ];

    const createdAssignments = [];
    for (let i = 0; i < Math.min(assignmentTemplates.length, createdCourses.length); i++) {
      const tpl = assignmentTemplates[i];
      const course = createdCourses[i];
      const dueDate = new Date('2026-07-01');
      dueDate.setDate(dueDate.getDate() + i * 7); // stagger due dates
      const asgn = await Assignment.create({
        title: tpl.title,
        description: tpl.desc,
        course: course._id,
        dueDate,
      });
      createdAssignments.push({ assignment: asgn, course });
    }

    // Create submissions: ~60% of enrolled students submit
    const submissionsToInsert = [];
    for (const { assignment, course } of createdAssignments) {
      const enrolled = course.studentsEnrolled;
      for (const sid of enrolled) {
        if (Math.random() < 0.6) {
          submissionsToInsert.push({
            assignment: assignment._id,
            student: sid,
            fileUrl: `/uploads/submission-${sid}.pdf`,
            status: 'Submitted',
          });
        }
      }
    }
    if (submissionsToInsert.length > 0) {
      await Submission.insertMany(submissionsToInsert, { ordered: false });
    }
    console.log(`📝  ${createdAssignments.length} assignments and ~${submissionsToInsert.length} submissions created.`);

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('        🎉  DATABASE SEEDED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  👤  Admin   : admin@acadtrack.com       (pw: admin123)`);
    console.log(`  👩‍🏫  Faculty  : faculty1@acadtrack.com   (pw: faculty123)`);
    console.log(`               ... faculty2 through faculty5`);
    console.log(`  🎓  Students: student@acadtrack.com     (pw: student123)`);
    console.log(`               ... student2 through student50`);
    console.log(`  📚  Courses : ${createdCourses.length} courses across 5 departments`);
    console.log(`  📅  Attendance: 20 class sessions per course`);
    console.log(`  📊  Academic Records: seeded for all students`);
    console.log(`  📢  Notices : ${noticesData.length}`);
    console.log(`  📝  Assignments: ${createdAssignments.length} | Submissions: ~${submissionsToInsert.length}`);
    console.log('═══════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌  Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
