import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { GraduationCap, CheckCircle2, User, HelpCircle, AlertCircle } from 'lucide-react';

const FacultyGrades = () => {
  const { authFetch } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  
  // Grading form state
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [semester, setSemester] = useState('1');
  const [marks, setMarks] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await authFetch('/academics/courses');
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch courses');
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourseId(data[0]._id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const selectedCourse = courses.find((c) => c._id === selectedCourseId);
  const enrolledStudents = selectedCourse?.studentsEnrolled || [];

  // Update default states when selection changes
  useEffect(() => {
    if (enrolledStudents.length > 0) {
      setSelectedStudentId(enrolledStudents[0]._id);
      setSemester(enrolledStudents[0].semester?.toString() || '1');
    } else {
      setSelectedStudentId('');
    }
    setSuccess('');
    setError('');
  }, [selectedCourseId, courses, enrolledStudents]);

  // Update semester input dynamically when student selection changes
  const handleStudentChange = (e) => {
    const sId = e.target.value;
    setSelectedStudentId(sId);
    
    const matchingStudent = enrolledStudents.find((s) => s._id === sId);
    if (matchingStudent && matchingStudent.semester) {
      setSemester(matchingStudent.semester.toString());
    }
  };

  const handleGradingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedStudentId || !marks) return;

    const numMarks = Number(marks);
    if (numMarks < 0 || numMarks > 100) {
      setError('Marks must be between 0 and 100.');
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await authFetch('/academics/grades', {
        method: 'POST',
        body: JSON.stringify({
          studentId: selectedStudentId,
          courseId: selectedCourseId,
          semester: Number(semester),
          marksObtained: numMarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to record grade');

      setSuccess('Marks uploaded and student GPA recalculated successfully!');
      setMarks('');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
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
        {courses.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-slate-400">
              <GraduationCap className="h-12 w-12 mx-auto text-slate-600 mb-2" />
              <h4 className="font-semibold text-slate-300">No Courses Available</h4>
              <p className="text-xs mt-1">Please register courses and enroll students to start grading.</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-1">
              <Card title="Upload Marks" subtitle="Recalculate semester GPA in real-time">
                <form onSubmit={handleGradingSubmit} className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Course
                    </label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full glass-input text-sm"
                    >
                      {courses.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.code} — {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Enrolled Student
                    </label>
                    {enrolledStudents.length === 0 ? (
                      <div className="text-xs text-rose-400 py-1 flex items-center space-x-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>No students enrolled in this course</span>
                      </div>
                    ) : (
                      <select
                        value={selectedStudentId}
                        onChange={handleStudentChange}
                        className="w-full glass-input text-sm"
                      >
                        {enrolledStudents.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name} ({s.studentId})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Semester
                      </label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full glass-input text-sm"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>
                            Sem {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Marks (0-100)
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 85"
                        min="0"
                        max="100"
                        value={marks}
                        onChange={(e) => setMarks(e.target.value)}
                        className="w-full glass-input text-sm text-center font-bold"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-400 text-xs">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs font-medium">
                      {success}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || enrolledStudents.length === 0 || !marks}
                    className="w-full glass-btn-primary py-2.5 text-sm font-semibold disabled:opacity-50 mt-2"
                  >
                    {submitting ? 'Recording...' : 'Submit Grades & Recalculate'}
                  </button>
                </form>
              </Card>
            </div>

            {/* Students List for Reference */}
            <div className="lg:col-span-2">
              <Card
                title={selectedCourse ? `${selectedCourse.code} Class List` : 'Class Enrolled Directory'}
                subtitle={`View and select student profiles in CS`}
              >
                {enrolledStudents.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <User className="h-10 w-10 mx-auto text-slate-600 mb-2" />
                    <p className="text-sm">No students enrolled in this course.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-darkBorder/40 bg-slate-900/40 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                          <th className="py-3 px-6">Roll ID</th>
                          <th className="py-3 px-6">Student Name</th>
                          <th className="py-3 px-6">Email Address</th>
                          <th className="py-3 px-6 text-center">Active Semester</th>
                          <th className="py-3 px-6 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-darkBorder/30">
                        {enrolledStudents.map((s) => (
                          <tr
                            key={s._id}
                            className={`hover:bg-slate-900/10 text-sm text-slate-300 transition-colors ${
                              selectedStudentId === s._id ? 'bg-primary-600/5' : ''
                            }`}
                          >
                            <td className="py-3.5 px-6 font-semibold text-slate-200">
                              {s.studentId || 'N/A'}
                            </td>
                            <td className="py-3.5 px-6">{s.name}</td>
                            <td className="py-3.5 px-6 text-slate-400 text-xs">{s.email}</td>
                            <td className="py-3.5 px-6 text-center font-semibold text-slate-200">
                              Sem {s.semester}
                            </td>
                            <td className="py-3.5 px-6 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStudentId(s._id);
                                  setSemester(s.semester?.toString() || '1');
                                }}
                                className="text-xs font-semibold text-primary-400 hover:text-primary-300 border border-primary-500/20 hover:border-primary-500/60 bg-primary-600/5 px-2.5 py-1.5 rounded-lg transition-all"
                              >
                                Select
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FacultyGrades;
