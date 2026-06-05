import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Course from '../models/Course.js';

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private (Faculty)
export const createAssignment = async (req, res) => {
  const { title, description, courseId, dueDate } = req.body;
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : '';

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: You are not teaching this course' });
    }

    const assignment = await Assignment.create({
      title,
      description,
      course: courseId,
      dueDate: new Date(dueDate),
      fileUrl,
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get assignments for a student (with their submissions) or faculty
// @route   GET /api/assignments
// @access  Private (Student, Faculty)
export const getAssignments = async (req, res) => {
  try {
    if (req.user.role === 'student') {
      // Find courses enrolled
      const courses = await Course.find({ studentsEnrolled: req.user._id });
      const courseIds = courses.map((c) => c._id);

      // Find all assignments for those courses
      const assignments = await Assignment.find({ course: { $in: courseIds } })
        .populate('course', 'name code')
        .sort({ dueDate: 1 });

      // Find all submissions by this student
      const submissions = await Submission.find({ student: req.user._id });

      // Map submissions to assignments
      const assignmentsWithSubmissions = assignments.map((assignment) => {
        const submission = submissions.find(
          (sub) => sub.assignment.toString() === assignment._id.toString()
        );
        return {
          ...assignment.toObject(),
          submission: submission || null,
        };
      });

      res.status(200).json(assignmentsWithSubmissions);
    } else if (req.user.role === 'faculty') {
      // Find courses taught by faculty
      const courses = await Course.find({ faculty: req.user._id });
      const courseIds = courses.map((c) => c._id);

      const assignments = await Assignment.find({ course: { $in: courseIds } })
        .populate('course', 'name code')
        .sort({ dueDate: -1 });

      res.status(200).json(assignments);
    } else {
      res.status(400).json({ message: 'Invalid role' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit assignment solution
// @route   POST /api/assignments/:assignmentId/submit
// @access  Private (Student)
export const submitAssignment = async (req, res) => {
  const { assignmentId } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a file submission' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if enrolled
    const course = await Course.findOne({
      _id: assignment.course,
      studentsEnrolled: req.user._id,
    });
    if (!course) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    // Check if already submitted
    let submission = await Submission.findOne({
      assignment: assignmentId,
      student: req.user._id,
    });

    if (submission) {
      // Update existing submission file
      submission.fileUrl = fileUrl;
      submission.submittedAt = Date.now();
      submission.status = 'Submitted';
      submission.grade = '';
      submission.feedback = '';
      await submission.save();
    } else {
      // Create new submission
      submission = await Submission.create({
        assignment: assignmentId,
        student: req.user._id,
        fileUrl,
      });
    }

    res.status(200).json({ message: 'Assignment submitted successfully', submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get submissions for a specific assignment
// @route   GET /api/assignments/:assignmentId/submissions
// @access  Private (Faculty)
export const getSubmissionsForAssignment = async (req, res) => {
  const { assignmentId } = req.params;

  try {
    const assignment = await Assignment.findById(assignmentId).populate('course');
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check permission
    if (assignment.course.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to assignment submissions' });
    }

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate('student', 'name email studentId department')
      .sort({ submittedAt: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Grade submission
// @route   POST /api/assignments/submissions/:submissionId/grade
// @access  Private (Faculty)
export const gradeSubmission = async (req, res) => {
  const { submissionId } = req.params;
  const { grade, feedback } = req.body;

  try {
    const submission = await Submission.findById(submissionId).populate({
      path: 'assignment',
      populate: { path: 'course' },
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Verify faculty owns the course
    if (submission.assignment.course.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized grading action' });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = 'Graded';
    await submission.save();

    res.status(200).json({ message: 'Submission graded successfully', submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
