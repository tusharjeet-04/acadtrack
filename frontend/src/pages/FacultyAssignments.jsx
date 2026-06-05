import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { FileSpreadsheet, Plus, CheckSquare, Calendar, Download, Eye, X, AlertCircle, BookOpen } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const FacultyAssignments = () => {
  const { authFetch, API_BASE, user } = useContext(AuthContext);

  // Base lists
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tab control
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create' | 'submissions'

  // Selected assignment for grading
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Assignment creation form
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
  });
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [formError, setFormError] = useState('');

  // Submission grading form modal
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Fetch courses taught by this faculty
      const coursesRes = await authFetch('/academics/courses');
      const coursesData = await coursesRes.json();
      if (!coursesRes.ok) throw new Error(coursesData.message || 'Failed to fetch courses');
      setCourses(coursesData);

      if (coursesData.length > 0) {
        setNewAssignment((prev) => ({ ...prev, courseId: coursesData[0]._id }));
      } else {
        // No courses — set empty courseId so form shows warning
        setNewAssignment((prev) => ({ ...prev, courseId: '' }));
      }

      // 2. Fetch assignments created by this faculty
      const assignmentsRes = await authFetch('/assignments');
      const assignmentsData = await assignmentsRes.json();
      if (!assignmentsRes.ok) throw new Error(assignmentsData.message || 'Failed to fetch assignments');
      setAssignments(assignmentsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleCreateAssignmentSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Explicit validation with user feedback
    if (!newAssignment.title.trim()) {
      setFormError('Please enter an assignment title.');
      return;
    }
    if (!newAssignment.courseId) {
      setFormError('No courses are assigned to your account. Please ask the admin to assign courses to your faculty email.');
      return;
    }
    if (!newAssignment.dueDate) {
      setFormError('Please select a due date.');
      return;
    }

    setSubmittingAssignment(true);

    const formData = new FormData();
    formData.append('title', newAssignment.title.trim());
    formData.append('description', newAssignment.description);
    formData.append('courseId', newAssignment.courseId);
    formData.append('dueDate', newAssignment.dueDate);
    if (assignmentFile) {
      formData.append('file', assignmentFile);
    }

    try {
      const token = JSON.parse(localStorage.getItem('acadtrack_user'))?.token;
      const res = await fetch(`${API_BASE}/assignments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create assignment');

      setNewAssignment({
        title: '',
        description: '',
        courseId: courses[0]?._id || '',
        dueDate: '',
      });
      setAssignmentFile(null);
      setFormError('');

      setActiveTab('list');
      fetchInitialData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const handleViewSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    setActiveTab('submissions');
    setSubmissions([]);
    setLoadingSubmissions(true);

    try {
      const res = await authFetch(`/assignments/${assignment._id}/submissions`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch submissions');
      setSubmissions(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleOpenGradingModal = (submission) => {
    setGradingSubmission(submission);
    setGrade(submission.grade || '');
    setFeedback(submission.feedback || '');
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    setSubmittingGrade(true);
    try {
      const res = await authFetch(`/assignments/submissions/${gradingSubmission._id}/grade`, {
        method: 'POST',
        body: JSON.stringify({ grade, feedback }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to grade submission');

      setSubmissions(
        submissions.map((sub) =>
          sub._id === gradingSubmission._id
            ? { ...sub, grade: data.submission.grade, feedback: data.submission.feedback, status: data.submission.status }
            : sub
        )
      );

      setGradingSubmission(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingGrade(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Top-level error (network/auth) */}
        {error && (
          <div className="flex items-start space-x-3 p-4 rounded-xl bg-rose-950/20 border border-rose-900/30 text-rose-400 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Failed to load data</p>
              <p className="text-xs mt-0.5 text-rose-400/70">{error}</p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-darkBorder/40">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-3.5 px-6 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'list'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Assignment List
          </button>
          <button
            onClick={() => { setActiveTab('create'); setFormError(''); }}
            className={`py-3.5 px-6 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'create'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Assignment
          </button>
          {activeTab === 'submissions' && (
            <button
              className="py-3.5 px-6 font-semibold text-sm transition-all border-b-2 border-indigo-500 text-indigo-400"
              disabled
            >
              Grade: {selectedAssignment?.title}
            </button>
          )}
        </div>

        {/* Tab 1: Assignments List */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            {assignments.length === 0 ? (
              <Card>
                <div className="text-center py-12 text-slate-400">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-slate-600 mb-2" />
                  <h4 className="font-semibold text-slate-300">No Assignments Found</h4>
                  <p className="text-xs mt-1">Select "Create Assignment" to post your first assignment.</p>
                  <button
                    onClick={() => { setActiveTab('create'); setFormError(''); }}
                    className="mt-4 glass-btn-primary text-xs px-4 py-2 inline-flex items-center space-x-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create Assignment</span>
                  </button>
                </div>
              </Card>
            ) : (
              assignments.map((assignment) => (
                <Card
                  key={assignment._id}
                  title={assignment.title}
                  subtitle={`${assignment.course?.code} — ${assignment.course?.name}`}
                  headerAction={
                    <button
                      onClick={() => handleViewSubmissions(assignment)}
                      className="flex items-center space-x-1 bg-primary-600/20 text-primary-400 hover:bg-primary-600 hover:text-white transition-all text-xs font-semibold px-3 py-1.5 rounded-lg border border-primary-500/20"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Review Submissions</span>
                    </button>
                  }
                >
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed">
                      {assignment.description || 'No description provided.'}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-slate-500 border-t border-darkBorder/20 pt-3 mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </span>
                      {assignment.fileUrl && (
                        <a
                          href={`${BACKEND_URL}${assignment.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-400 hover:underline flex items-center space-x-1"
                        >
                          <span>Worksheet Attached</span>
                          <Download className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Create Assignment */}
        {activeTab === 'create' && (
          <div className="max-w-xl mx-auto">
            {/* No courses banner */}
            {courses.length === 0 && (
              <div className="mb-4 flex items-start space-x-3 p-4 rounded-xl bg-amber-950/20 border border-amber-800/30 text-amber-300">
                <BookOpen className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">No courses assigned to your account</p>
                  <p className="text-xs mt-1 text-amber-300/70">
                    An admin must first create a course and assign it to your faculty email
                    <strong className="text-amber-200"> ({user?.email})</strong> before you can create assignments.
                  </p>
                  <p className="text-xs mt-2 text-amber-300/70">
                    Ask admin to go to <strong>Admin Panel → Courses → Create Course</strong> and enter your email as the assigned faculty.
                  </p>
                </div>
              </div>
            )}

            <Card title="Publish New Assignment" subtitle="Deliver coursework directly to student dashboards">
              <form onSubmit={handleCreateAssignmentSubmit} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Assignment Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Red-Black Tree Complexities"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                    className="w-full glass-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Description & Instructions
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Write detailed guidelines..."
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                    className="w-full glass-input text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Course to Assign
                    </label>
                    {courses.length === 0 ? (
                      <div className="w-full glass-input text-sm text-slate-500 flex items-center space-x-2 opacity-60 cursor-not-allowed">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>No courses available</span>
                      </div>
                    ) : (
                      <select
                        value={newAssignment.courseId}
                        onChange={(e) => setNewAssignment({ ...newAssignment, courseId: e.target.value })}
                        className="w-full glass-input text-sm"
                      >
                        {courses.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.code} — {c.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Due Date Threshold
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                      className="w-full glass-input text-sm text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Attach Worksheet Document (PDF/Doc/Zip) — Optional
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setAssignmentFile(e.target.files[0])}
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 file:transition-all cursor-pointer"
                  />
                </div>

                {/* Form validation error */}
                {formError && (
                  <div className="flex items-start space-x-2 p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-400 text-xs">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingAssignment || courses.length === 0}
                  className="w-full glass-btn-primary py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                >
                  {submittingAssignment ? 'Publishing...' : courses.length === 0 ? 'No Courses Assigned — Cannot Broadcast' : 'Broadcast Assignment'}
                </button>
              </form>
            </Card>
          </div>
        )}

        {/* Tab 3: Submissions Review */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-100">{selectedAssignment?.title}</h3>
                <p className="text-xs text-slate-400">
                  Course: {selectedAssignment?.course?.code} — {selectedAssignment?.course?.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedAssignment(null);
                  setActiveTab('list');
                }}
                className="glass-btn-secondary text-xs py-1.5 px-3 flex items-center space-x-1"
              >
                <span>Back to list</span>
              </button>
            </div>

            {loadingSubmissions ? (
              <div className="py-12">
                <LoadingSpinner size="medium" />
              </div>
            ) : submissions.length === 0 ? (
              <Card>
                <div className="text-center py-12 text-slate-400">
                  <AlertCircle className="h-10 w-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm">No students have uploaded answers for this assignment yet.</p>
                </div>
              </Card>
            ) : (
              <Card title="Student Submissions Sheet" subtitle={`Total Submissions: ${submissions.length}`}>
                <div className="overflow-x-auto -mx-6">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-darkBorder/40 bg-slate-900/40 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <th className="py-3 px-6">Roll ID</th>
                        <th className="py-3 px-6">Student Name</th>
                        <th className="py-3 px-6">Uploaded File</th>
                        <th className="py-3 px-6 text-center">Submitted On</th>
                        <th className="py-3 px-6 text-center">Status</th>
                        <th className="py-3 px-6 text-center">Grade</th>
                        <th className="py-3 px-6 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-darkBorder/30">
                      {submissions.map((sub) => {
                        const isGraded = sub.status === 'Graded';
                        return (
                          <tr
                            key={sub._id}
                            className="hover:bg-slate-900/10 text-sm text-slate-300 transition-colors"
                          >
                            <td className="py-3.5 px-6 font-semibold text-slate-200">
                              {sub.student?.studentId || 'N/A'}
                            </td>
                            <td className="py-3.5 px-6">{sub.student?.name}</td>
                            <td className="py-3.5 px-6">
                              <a
                                href={`${BACKEND_URL}${sub.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-400 hover:underline flex items-center space-x-1 text-xs"
                              >
                                <span>Download File</span>
                                <Download className="h-3 w-3" />
                              </a>
                            </td>
                            <td className="py-3.5 px-6 text-center text-xs text-slate-400">
                              {new Date(sub.submittedAt).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-6 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                                isGraded
                                  ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/20'
                                  : 'bg-indigo-950/20 text-indigo-400 border border-indigo-900/20 animate-pulse'
                              }`}>
                                {sub.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 text-center font-bold text-slate-200">
                              {sub.grade || '—'}
                            </td>
                            <td className="py-3.5 px-6 text-center">
                              <button
                                type="button"
                                onClick={() => handleOpenGradingModal(sub)}
                                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                                  isGraded
                                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                                    : 'bg-primary-600/15 text-primary-400 border-primary-500/20 hover:bg-primary-600 hover:text-white'
                                }`}
                              >
                                {isGraded ? 'Review / Edit' : 'Evaluate'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Grading Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setGradingSubmission(null)}
          />
          <div className="relative glass-panel bg-darkCard border border-darkBorder p-6 max-w-md w-full z-10 shadow-2xl">
            <button
              onClick={() => setGradingSubmission(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-semibold text-slate-100 mb-1">Evaluate Submission</h3>
            <p className="text-xs text-slate-400 mb-4">
              Student: {gradingSubmission.student?.name} ({gradingSubmission.student?.studentId})
            </p>

            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Assignment Grade (e.g. A, B+, Pass, or 90)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A+"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full glass-input text-sm font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Critique & Feedback
                </label>
                <textarea
                  rows="4"
                  placeholder="Provide brief feedback to the student..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full glass-input text-sm resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="flex-1 glass-btn-secondary py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingGrade}
                  className="flex-1 glass-btn-primary py-2 disabled:opacity-50"
                >
                  {submittingGrade ? 'Recording...' : 'Submit Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default FacultyAssignments;
