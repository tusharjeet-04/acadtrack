import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { Calendar, Check, X, AlertCircle } from 'lucide-react';

const FacultyAttendance = () => {
  const { authFetch } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Holds local attendance state: { [studentId]: 'Present' | 'Absent' }
  const [attendanceRecords, setAttendanceRecords] = useState({});

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

  // Update student records when course selection changes
  useEffect(() => {
    if (!selectedCourseId) return;

    const activeCourse = courses.find((c) => c._id === selectedCourseId);
    if (activeCourse && activeCourse.studentsEnrolled) {
      const initialRecords = {};
      activeCourse.studentsEnrolled.forEach((student) => {
        initialRecords[student._id] = 'Present'; // Default to Present
      });
      setAttendanceRecords(initialRecords);
      setSuccess('');
      setError('');
    }
  }, [selectedCourseId, courses]);

  const toggleStatus = (studentId) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    setError('');
    setSuccess('');
    setSubmitting(true);

    const formattedRecords = Object.keys(attendanceRecords).map((studentId) => ({
      student: studentId,
      status: attendanceRecords[studentId],
    }));

    try {
      const res = await authFetch('/attendance', {
        method: 'POST',
        body: JSON.stringify({
          courseId: selectedCourseId,
          date,
          records: formattedRecords,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save attendance');
      
      setSuccess('Attendance sheet submitted successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCourse = courses.find((c) => c._id === selectedCourseId);
  const enrolledStudents = selectedCourse?.studentsEnrolled || [];

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
              <Calendar className="h-12 w-12 mx-auto text-slate-600 mb-2" />
              <h4 className="font-semibold text-slate-300">No Courses Assigned</h4>
              <p className="text-xs mt-1">Contact administration to assign courses to your faculty ID.</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Control Panel */}
            <div className="lg:col-span-1">
              <Card title="Attendance Register" subtitle="Configure class details">
                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Select Course
                    </label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full glass-input text-sm"
                    >
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.code} — {course.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Lecture Date
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      max={new Date().toISOString().split('T')[0]} // Block future dates
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full glass-input text-sm text-center"
                    />
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
                    disabled={submitting || enrolledStudents.length === 0}
                    className="w-full glass-btn-primary py-2.5 text-sm font-semibold disabled:opacity-50 mt-2"
                  >
                    {submitting ? 'Submitting...' : 'Save Attendance Record'}
                  </button>
                </form>
              </Card>
            </div>

            {/* Students List */}
            <div className="lg:col-span-2">
              <Card
                title={selectedCourse ? `${selectedCourse.code} Student Sheet` : 'Enrolled Students'}
                subtitle={`Total Enrolled: ${enrolledStudents.length} Students`}
              >
                {enrolledStudents.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <AlertCircle className="h-10 w-10 mx-auto text-slate-600 mb-2" />
                    <p className="text-sm">No students enrolled in this course yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-darkBorder/40 bg-slate-900/40 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                          <th className="py-3 px-6">Roll ID</th>
                          <th className="py-3 px-6">Student Name</th>
                          <th className="py-3 px-6">Department</th>
                          <th className="py-3 px-6 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-darkBorder/30">
                        {enrolledStudents.map((student) => {
                          const status = attendanceRecords[student._id] || 'Present';
                          return (
                            <tr
                              key={student._id}
                              className="hover:bg-slate-900/10 text-sm text-slate-300 transition-colors"
                            >
                              <td className="py-3.5 px-6 font-semibold text-slate-200">
                                {student.studentId || 'N/A'}
                              </td>
                              <td className="py-3.5 px-6">{student.name}</td>
                              <td className="py-3.5 px-6 text-slate-400 text-xs">
                                {student.department}
                              </td>
                              <td className="py-3.5 px-6 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleStatus(student._id)}
                                  className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                    status === 'Present'
                                      ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-500/5'
                                      : 'bg-rose-950/20 text-rose-400 border-rose-500/20 shadow-lg shadow-rose-500/5'
                                  }`}
                                >
                                  {status === 'Present' ? (
                                    <>
                                      <Check className="h-3.5 w-3.5" />
                                      <span>Present</span>
                                    </>
                                  ) : (
                                    <>
                                      <X className="h-3.5 w-3.5" />
                                      <span>Absent</span>
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
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

export default FacultyAttendance;
