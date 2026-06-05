import Course from '../models/Course.js';
import AcademicRecord from '../models/AcademicRecord.js';
import Attendance from '../models/Attendance.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';

// @desc    Get dashboard statistics & placement eligibility for a Student
// @route   GET /api/dashboard/student
// @access  Private (Student)
export const getStudentDashboardStats = async (req, res) => {
  const studentId = req.user._id;

  try {
    // 1. Fetch academic history to get CGPA and SGPA per semester
    const academicRecords = await AcademicRecord.find({ student: studentId })
      .populate('courses.course', 'name code credits')
      .sort({ semester: 1 });

    const cgpa = academicRecords.length > 0 ? academicRecords[academicRecords.length - 1].cgpa : 0.0;

    // Calculate Backlogs (courses with grade 'F')
    let backlogCount = 0;
    let totalCredits = 0;
    
    academicRecords.forEach((record) => {
      record.courses.forEach((c) => {
        if (c.grade === 'F') {
          backlogCount++;
        } else {
          // Add credits of passed courses
          totalCredits += c.course ? c.course.credits : 3;
        }
      });
    });

    // 2. Fetch enrolled courses
    const courses = await Course.find({ studentsEnrolled: studentId });

    // 3. Fetch attendance percentages
    let totalClassesEncountered = 0;
    let totalClassesPresent = 0;
    const subjectAttendance = [];

    for (let course of courses) {
      const attendanceRecords = await Attendance.find({ course: course._id });
      let courseClasses = attendanceRecords.length;
      let coursePresents = 0;

      attendanceRecords.forEach((att) => {
        const studentRec = att.records.find(
          (rec) => rec.student.toString() === studentId.toString()
        );
        if (studentRec && studentRec.status === 'Present') {
          coursePresents++;
        }
      });

      totalClassesEncountered += courseClasses;
      totalClassesPresent += coursePresents;

      subjectAttendance.push({
        courseCode: course.code,
        courseName: course.name,
        percentage: courseClasses > 0 ? Number(((coursePresents / courseClasses) * 100).toFixed(1)) : 100,
      });
    }

    const overallAttendance = totalClassesEncountered > 0 
      ? Number(((totalClassesPresent / totalClassesEncountered) * 100).toFixed(1)) 
      : 100;

    // 4. Placement Eligibility Evaluation
    // Criteria: CGPA >= 7.0, Attendance >= 75%, Backlogs === 0
    const cgpaEligible = cgpa >= 7.0;
    const attendanceEligible = overallAttendance >= 75.0;
    const noBacklogs = backlogCount === 0;
    const isEligible = cgpaEligible && attendanceEligible && noBacklogs;

    const eligibilityDetails = {
      isEligible,
      criteria: {
        cgpa: { value: cgpa, required: 7.0, status: cgpaEligible },
        attendance: { value: overallAttendance, required: 75.0, status: attendanceEligible },
        backlogs: { value: backlogCount, required: 0, status: noBacklogs },
      },
    };

    // 5. Build charts data for SGPA trend
    const gpaTrend = academicRecords.map((rec) => ({
      semester: `Sem ${rec.semester}`,
      sgpa: rec.sgpa,
      cgpa: rec.cgpa,
    }));

    res.status(200).json({
      summary: {
        cgpa,
        overallAttendance,
        backlogCount,
        totalCredits,
        coursesCount: courses.length,
      },
      eligibilityDetails,
      gpaTrend,
      subjectAttendance,
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard statistics for a Faculty member
// @route   GET /api/dashboard/faculty
// @access  Private (Faculty)
export const getFacultyDashboardStats = async (req, res) => {
  const facultyId = req.user._id;

  try {
    // 1. Courses taught
    const courses = await Course.find({ faculty: facultyId });
    const courseIds = courses.map((c) => c._id);

    // 2. Distinct student count
    const studentIds = new Set();
    courses.forEach((course) => {
      course.studentsEnrolled.forEach((studentId) => {
        studentIds.add(studentId.toString());
      });
    });

    // 3. Total assignments posted
    const assignmentsCount = await Assignment.countDocuments({ course: { $in: courseIds } });

    // 4. Pending submissions count (Submitted but not graded)
    const assignments = await Assignment.find({ course: { $in: courseIds } });
    const assignmentIds = assignments.map((a) => a._id);
    const pendingGradingCount = await Submission.countDocuments({
      assignment: { $in: assignmentIds },
      status: 'Submitted',
    });

    res.status(200).json({
      coursesCount: courses.length,
      studentsCount: studentIds.size,
      assignmentsCount,
      pendingGradingCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard statistics for Admin
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
export const getAdminDashboardStats = async (req, res) => {
  try {
    const studentCount = await User.countDocuments({ role: 'student' });
    const facultyCount = await User.countDocuments({ role: 'faculty' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const courseCount = await Course.countDocuments();

    // Additional aggregated information: Department distributions
    const deptDistribution = await User.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      studentCount,
      facultyCount,
      adminCount,
      courseCount,
      deptDistribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
