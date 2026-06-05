import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { BookOpen, Plus, UserPlus, GraduationCap, AlertCircle, ChevronDown, Users } from 'lucide-react';

const AdminCourses = () => {
  const { authFetch } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [facultyList, setFacultyList] = useState([]); // All registered faculty
  const [studentList, setStudentList] = useState([]); // All registered students
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Navigation tabs
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create' | 'enroll'

  // Create course form state
  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    credits: '3',
    department: 'Computer Science',
    facultyEmail: '',
  });
  const [submittingCourse, setSubmittingCourse] = useState(false);
  const [courseError, setCourseError] = useState('');
  const [courseSuccess, setCourseSuccess] = useState('');

  // Enroll student form state
  const [enrollment, setEnrollment] = useState({
    courseId: '',
    studentEmail: '',
  });
  const [submittingEnrollment, setSubmittingEnrollment] = useState(false);
  const [enrollError, setEnrollError] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState('');

  // Semester filter for student dropdown
  const [semesterFilter, setSemesterFilter] = useState('all');

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch courses and all users in parallel
      const [coursesRes, usersRes] = await Promise.all([
        authFetch('/academics/courses'),
        authFetch('/auth/users'),
      ]);

      const coursesData = await coursesRes.json();
      const usersData = await usersRes.json();

      if (!coursesRes.ok) throw new Error(coursesData.message || 'Failed to fetch courses');
      if (!usersRes.ok) throw new Error(usersData.message || 'Failed to fetch users');

      setCourses(coursesData);
      const faculty = usersData.filter((u) => u.role === 'faculty');
      const students = usersData.filter((u) => u.role === 'student');
      setFacultyList(faculty);
      setStudentList(students);

      // Prefill dropdowns
      if (faculty.length > 0 && !newCourse.facultyEmail) {
        setNewCourse((prev) => ({ ...prev, facultyEmail: faculty[0].email }));
      }
      if (coursesData.length > 0) {
        setEnrollment((prev) => ({ ...prev, courseId: coursesData[0]._id }));
      }
      if (students.length > 0) {
        setEnrollment((prev) => ({ ...prev, studentEmail: students[0].email }));
      }
      // Reset semester filter on fresh load
      setSemesterFilter('all');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCourseError('');
    setCourseSuccess('');

    if (!newCourse.name || !newCourse.code || !newCourse.facultyEmail) {
      setCourseError('All fields including faculty assignment are required.');
      return;
    }

    setSubmittingCourse(true);
    try {
      const res = await authFetch('/academics/courses', {
        method: 'POST',
        body: JSON.stringify(newCourse),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create course');

      setCourseSuccess(`Course "${newCourse.code}" created and assigned to ${newCourse.facultyEmail}!`);
      setNewCourse({
        name: '',
        code: '',
        credits: '3',
        department: 'Computer Science',
        facultyEmail: facultyList[0]?.email || '',
      });
      setTimeout(() => setCourseSuccess(''), 5000);
      fetchAll();
    } catch (err) {
      setCourseError(err.message);
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    setEnrollError('');
    setEnrollSuccess('');

    if (!enrollment.courseId || !enrollment.studentEmail) {
      setEnrollError('Please select both a course and a student.');
      return;
    }

    setSubmittingEnrollment(true);
    const courseName = courses.find((c) => c._id === enrollment.courseId)?.code || 'course';

    // --- Bulk enroll: enroll all filtered students ---
    if (enrollment.studentEmail === 'all') {
      const filtered = semesterFilter === 'all'
        ? studentList
        : studentList.filter((s) => String(s.semester) === semesterFilter);

      let successCount = 0;
      let skipCount = 0;
      let failCount = 0;

      for (const student of filtered) {
        try {
          const res = await authFetch('/academics/courses/enroll', {
            method: 'POST',
            body: JSON.stringify({ courseId: enrollment.courseId, studentEmail: student.email }),
          });
          const data = await res.json();
          if (res.ok) {
            successCount++;
          } else if (data.message?.toLowerCase().includes('already enrolled')) {
            skipCount++;
          } else {
            failCount++;
          }
        } catch {
          failCount++;
        }
      }

      const parts = [];
      if (successCount > 0) parts.push(`${successCount} enrolled`);
      if (skipCount > 0) parts.push(`${skipCount} already enrolled (skipped)`);
      if (failCount > 0) parts.push(`${failCount} failed`);
      setEnrollSuccess(`Bulk enrollment in ${courseName}: ${parts.join(', ')}.`);
      setTimeout(() => setEnrollSuccess(''), 7000);
      fetchAll();
      setSubmittingEnrollment(false);
      return;
    }

    // --- Single student enroll ---
    try {
      const res = await authFetch('/academics/courses/enroll', {
        method: 'POST',
        body: JSON.stringify(enrollment),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to enroll student');

      setEnrollSuccess(`Student enrolled in ${courseName} successfully!`);
      setTimeout(() => setEnrollSuccess(''), 5000);
      fetchAll();
    } catch (err) {
      setEnrollError(err.message);
    } finally {
      setSubmittingEnrollment(false);
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

        {error && (
          <div className="flex items-center space-x-3 p-4 rounded-xl bg-rose-950/20 border border-rose-900/30 text-rose-400 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Navigation tabs */}
        <div className="flex border-b border-darkBorder/40">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-3.5 px-6 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'list'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Course Directory
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-3.5 px-6 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'create'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Course
          </button>
          <button
            onClick={() => setActiveTab('enroll')}
            className={`py-3.5 px-6 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'enroll'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Enroll Student
          </button>
        </div>

        {/* Tab 1: Course list */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            {courses.length === 0 ? (
              <Card>
                <div className="text-center py-12 text-slate-400">
                  <BookOpen className="h-12 w-12 mx-auto text-slate-600 mb-2" />
                  <h4 className="font-semibold text-slate-300">No Courses Active</h4>
                  <p className="text-xs mt-1">Select "Create Course" to register a module.</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-4 glass-btn-primary text-xs px-4 py-2"
                  >
                    Create First Course
                  </button>
                </div>
              </Card>
            ) : (
              <Card title="Active Course Directory" subtitle="System courses and instructor roster">
                <div className="overflow-x-auto -mx-6">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-darkBorder/40 bg-slate-900/40 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <th className="py-3 px-6">Course Code</th>
                        <th className="py-3 px-6">Course Name</th>
                        <th className="py-3 px-6">Department</th>
                        <th className="py-3 px-6 text-center">Credits</th>
                        <th className="py-3 px-6">Faculty Instructor</th>
                        <th className="py-3 px-6 text-center">Enrolled</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-darkBorder/30">
                      {courses.map((course) => (
                        <tr
                          key={course._id}
                          className="hover:bg-slate-900/10 text-sm text-slate-300 transition-colors"
                        >
                          <td className="py-3.5 px-6 font-semibold text-slate-200">
                            {course.code}
                          </td>
                          <td className="py-3.5 px-6">{course.name}</td>
                          <td className="py-3.5 px-6 text-slate-400 text-xs">{course.department}</td>
                          <td className="py-3.5 px-6 text-center font-semibold text-slate-200">
                            {course.credits}
                          </td>
                          <td className="py-3.5 px-6">
                            <div className="text-sm font-medium text-slate-200">{course.faculty?.name}</div>
                            <div className="text-[10px] text-slate-500">{course.faculty?.email}</div>
                          </td>
                          <td className="py-3.5 px-6 text-center font-semibold text-slate-200">
                            {course.studentsEnrolled?.length || 0} Students
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Tab 2: Create Course */}
        {activeTab === 'create' && (
          <div className="max-w-xl mx-auto">
            {facultyList.length === 0 && (
              <div className="mb-4 flex items-start space-x-3 p-4 rounded-xl bg-amber-950/20 border border-amber-800/30 text-amber-300">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">No faculty accounts registered yet</p>
                  <p className="text-xs mt-1 text-amber-300/70">
                    A faculty member must sign up first. Then you can assign courses to them here.
                  </p>
                </div>
              </div>
            )}

            <Card title="Register New Course" subtitle="Assign a course module to a faculty member">
              <form onSubmit={handleCreateCourse} className="space-y-4 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Course Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CS401"
                      value={newCourse.code}
                      onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                      className="w-full glass-input text-sm uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Credits
                    </label>
                    <select
                      value={newCourse.credits}
                      onChange={(e) => setNewCourse({ ...newCourse, credits: e.target.value })}
                      className="w-full glass-input text-sm"
                    >
                      {[1, 2, 3, 4, 5, 6].map((cr) => (
                        <option key={cr} value={cr}>
                          {cr} Credits
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Course Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Advanced Data Structures & Algorithms"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                    className="w-full glass-input text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Department
                    </label>
                    <select
                      value={newCourse.department}
                      onChange={(e) => setNewCourse({ ...newCourse, department: e.target.value })}
                      className="w-full glass-input text-sm"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Business Administration">Business Administration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Assign to Faculty
                    </label>
                    {facultyList.length > 0 ? (
                      <select
                        value={newCourse.facultyEmail}
                        onChange={(e) => setNewCourse({ ...newCourse, facultyEmail: e.target.value })}
                        className="w-full glass-input text-sm"
                      >
                        {facultyList.map((f) => (
                          <option key={f._id} value={f.email}>
                            {f.name} ({f.email})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="email"
                        required
                        placeholder="faculty@example.com"
                        value={newCourse.facultyEmail}
                        onChange={(e) => setNewCourse({ ...newCourse, facultyEmail: e.target.value })}
                        className="w-full glass-input text-sm"
                      />
                    )}
                    {facultyList.length > 0 && (
                      <p className="text-[10px] text-slate-500 mt-1">
                        {facultyList.length} faculty account{facultyList.length > 1 ? 's' : ''} registered
                      </p>
                    )}
                  </div>
                </div>

                {courseError && (
                  <div className="flex items-center space-x-2 p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-400 text-xs">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{courseError}</span>
                  </div>
                )}
                {courseSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs font-medium">
                    ✓ {courseSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingCourse || facultyList.length === 0}
                  className="w-full glass-btn-primary py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                >
                  {submittingCourse ? 'Registering...' : 'Register Course & Assign Faculty'}
                </button>
              </form>
            </Card>
          </div>
        )}

        {/* Tab 3: Enroll Student */}
        {activeTab === 'enroll' && (
          <div className="max-w-xl mx-auto">
            <Card title="Student Course Enrollment" subtitle="Add students to active course classes">
              {courses.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <AlertCircle className="h-10 w-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm">No courses exist yet.</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-3 glass-btn-primary text-xs px-4 py-2"
                  >
                    Create a Course First
                  </button>
                </div>
              ) : studentList.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Users className="h-10 w-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm">No student accounts registered yet.</p>
                  <p className="text-xs mt-1 text-slate-500">Students must sign up before they can be enrolled.</p>
                </div>
              ) : (
                <form onSubmit={handleEnrollStudent} className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Target Course
                    </label>
                    <select
                      value={enrollment.courseId}
                      onChange={(e) => setEnrollment({ ...enrollment, courseId: e.target.value })}
                      className="w-full glass-input text-sm"
                    >
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.code} — {course.name} ({course.faculty?.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Semester Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Filter by Semester
                    </label>
                    <select
                      value={semesterFilter}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSemesterFilter(val);
                        // Auto-select first student matching new filter
                        const filtered = val === 'all'
                          ? studentList
                          : studentList.filter((s) => String(s.semester) === val);
                        if (filtered.length > 0) {
                          setEnrollment((prev) => ({ ...prev, studentEmail: filtered[0].email }));
                        } else {
                          setEnrollment((prev) => ({ ...prev, studentEmail: '' }));
                        }
                      }}
                      className="w-full glass-input text-sm"
                    >
                      <option value="all">All Students</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                        const count = studentList.filter((s) => s.semester === sem).length;
                        return (
                          <option key={sem} value={String(sem)} disabled={count === 0}>
                            Semester {sem} ({count} student{count !== 1 ? 's' : ''})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Student Dropdown (filtered by semester) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Select Student
                    </label>
                    {(() => {
                      const filtered = semesterFilter === 'all'
                        ? studentList
                        : studentList.filter((s) => String(s.semester) === semesterFilter);
                      return filtered.length === 0 ? (
                        <div className="flex items-center space-x-2 p-3 rounded-lg bg-amber-950/20 border border-amber-800/30 text-amber-300 text-xs">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          <span>No students found for Semester {semesterFilter}.</span>
                        </div>
                      ) : (
                        <>
                          <select
                            value={enrollment.studentEmail}
                            onChange={(e) => setEnrollment({ ...enrollment, studentEmail: e.target.value })}
                            className="w-full glass-input text-sm"
                          >
                            <option value="all">
                              ⭐ All Students ({filtered.length}{semesterFilter !== 'all' ? ` in Sem ${semesterFilter}` : ' total'})
                            </option>
                            {filtered.map((s) => (
                              <option key={s._id} value={s.email}>
                                {s.name} — {s.email} {s.studentId ? `(${s.studentId})` : ''}{s.semester ? ` · Sem ${s.semester}` : ''}
                              </option>
                            ))}
                          </select>
                          <p className="text-[10px] text-slate-500 mt-1">
                            {enrollment.studentEmail === 'all'
                              ? `Will enroll all ${filtered.length} student${filtered.length !== 1 ? 's' : ''} in this course`
                              : `Showing ${filtered.length} of ${studentList.length} student${studentList.length !== 1 ? 's' : ''}${semesterFilter !== 'all' ? ` in Semester ${semesterFilter}` : ' (all semesters)'}`
                            }
                          </p>
                        </>
                      );
                    })()}
                  </div>

                  {enrollError && (
                    <div className="flex items-center space-x-2 p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-400 text-xs">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{enrollError}</span>
                    </div>
                  )}
                  {enrollSuccess && (
                    <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs font-medium">
                      ✓ {enrollSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submittingEnrollment || !enrollment.studentEmail}
                    className="w-full glass-btn-primary py-2.5 text-sm font-semibold disabled:opacity-50 mt-2"
                  >
                    {submittingEnrollment
                      ? 'Enrolling...'
                      : enrollment.studentEmail === 'all'
                        ? `Enroll All ${(
                            semesterFilter === 'all' ? studentList : studentList.filter((s) => String(s.semester) === semesterFilter)
                          ).length} Students in Course`
                        : 'Enroll Student in Course'
                    }
                  </button>
                </form>
              )}
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminCourses;
