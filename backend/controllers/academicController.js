import Course from '../models/Course.js';
import AcademicRecord from '../models/AcademicRecord.js';
import User from '../models/User.js';

// Helper to determine Grade and Grade Points from Marks
const getGradeDetails = (marks) => {
  if (marks >= 90) return { grade: 'O', points: 10 };
  if (marks >= 80) return { grade: 'A+', points: 9 };
  if (marks >= 70) return { grade: 'A', points: 8 };
  if (marks >= 60) return { grade: 'B+', points: 7 };
  if (marks >= 50) return { grade: 'B', points: 6 };
  if (marks >= 40) return { grade: 'C', points: 5 };
  if (marks >= 33) return { grade: 'P', points: 4 };
  return { grade: 'F', points: 0 };
};

// @desc    Create a new course
// @route   POST /api/academics/courses
// @access  Private (Admin)
export const createCourse = async (req, res) => {
  const { name, code, credits, department, facultyEmail } = req.body;

  try {
    const facultyUser = await User.findOne({ email: facultyEmail, role: 'faculty' });
    if (!facultyUser) {
      return res.status(404).json({ message: 'Faculty member not found with this email' });
    }

    const courseExists = await Course.findOne({ code });
    if (courseExists) {
      return res.status(400).json({ message: 'Course with this code already exists' });
    }

    const course = await Course.create({
      name,
      code,
      credits: Number(credits),
      department,
      faculty: facultyUser._id,
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get courses based on role
// @route   GET /api/academics/courses
// @access  Private (Admin, Faculty, Student)
export const getCourses = async (req, res) => {
  try {
    let courses;
    if (req.user.role === 'admin') {
      courses = await Course.find()
        .populate('faculty', 'name email department')
        .populate('studentsEnrolled', '_id'); // just IDs for count
    } else if (req.user.role === 'faculty') {
      courses = await Course.find({ faculty: req.user._id }).populate('studentsEnrolled', 'name email studentId department semester');
    } else if (req.user.role === 'student') {
      courses = await Course.find({ studentsEnrolled: req.user._id }).populate('faculty', 'name email department');
    }

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Enroll student in course
// @route   POST /api/academics/courses/enroll
// @access  Private (Admin)
export const enrollStudent = async (req, res) => {
  const { courseId, studentEmail } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const student = await User.findOne({ email: studentEmail, role: 'student' });
    if (!student) {
      return res.status(404).json({ message: 'Student not found with this email' });
    }

    if (course.studentsEnrolled.includes(student._id)) {
      return res.status(400).json({ message: 'Student is already enrolled in this course' });
    }

    course.studentsEnrolled.push(student._id);
    await course.save();

    res.status(200).json({ message: 'Student enrolled successfully in course', course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add or Update marks/grades for a student
// @route   POST /api/academics/grades
// @access  Private (Faculty)
export const addOrUpdateGrades = async (req, res) => {
  const { studentId, courseId, semester, marksObtained } = req.body;

  try {
    const studentUser = await User.findById(studentId);
    if (!studentUser || studentUser.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Double check if this course is taught by the logged-in faculty
    if (course.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to grade this course' });
    }

    const { grade, points } = getGradeDetails(Number(marksObtained));

    // Find if student has academic record for this semester
    let record = await AcademicRecord.findOne({ student: studentId, semester: Number(semester) });

    const courseGradeEntry = {
      course: courseId,
      marksObtained: Number(marksObtained),
      grade,
      gradePoints: points,
    };

    if (record) {
      // Find course index
      const courseIndex = record.courses.findIndex(
        (c) => c.course.toString() === courseId.toString()
      );

      if (courseIndex > -1) {
        // Update existing grade entry
        record.courses[courseIndex] = courseGradeEntry;
      } else {
        // Add new course grade entry
        record.courses.push(courseGradeEntry);
      }
    } else {
      // Create new record for the semester
      record = new AcademicRecord({
        student: studentId,
        semester: Number(semester),
        courses: [courseGradeEntry],
        sgpa: 0, // Calculate below
        cgpa: 0, // Calculate below
      });
    }

    // Retrieve all course documents in the record to get credit details for SGPA calculation
    const courseIds = record.courses.map((c) => c.course);
    const populatedCourses = await Course.find({ _id: { $in: courseIds } });

    let totalCredits = 0;
    let weightedPoints = 0;

    record.courses.forEach((c) => {
      const courseDetails = populatedCourses.find(
        (pc) => pc._id.toString() === c.course.toString()
      );
      const credits = courseDetails ? courseDetails.credits : 3; // default 3 credits
      totalCredits += credits;
      weightedPoints += c.gradePoints * credits;
    });

    const calculatedSGPA = totalCredits > 0 ? Number((weightedPoints / totalCredits).toFixed(2)) : 0;
    record.sgpa = calculatedSGPA;

    // Save record first to perform CGPA calculations
    await record.save();

    // Calculate overall CGPA
    const allRecords = await AcademicRecord.find({ student: studentId });
    const totalSGPA = allRecords.reduce((sum, rec) => sum + rec.sgpa, 0);
    const calculatedCGPA = allRecords.length > 0 ? Number((totalSGPA / allRecords.length).toFixed(2)) : 0;

    // Update all records for this student with the new cumulative CGPA
    await AcademicRecord.updateMany({ student: studentId }, { $set: { cgpa: calculatedCGPA } });
    record.cgpa = calculatedCGPA;

    res.status(200).json({
      message: 'Grades recorded and GPA computed successfully',
      record,
    });
  } catch (error) {
    console.error('Add grades error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student academic records (SGPA, CGPA, courses grades)
// @route   GET /api/academics/records
// @access  Private (Student)
// @route   GET /api/academics/records/:studentId
// @access  Private (Faculty, Admin)
export const getAcademicRecords = async (req, res) => {
  const studentId = req.params.studentId || req.user._id;

  try {
    // Check access permissions
    if (req.user.role === 'student' && req.user._id.toString() !== studentId.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to academic records' });
    }

    const records = await AcademicRecord.find({ student: studentId })
      .populate('courses.course', 'name code credits')
      .sort({ semester: 1 });

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
