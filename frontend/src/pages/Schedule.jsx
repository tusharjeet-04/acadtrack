import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';
import { Calendar, Clock, MapPin, User, Trash2, Plus, X, BookOpen, Users } from 'lucide-react';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Schedule = () => {
  const { user, authFetch } = useContext(AuthContext);
  const [schedules, setSchedules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    course: '',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '10:30',
    classroom: '',
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch Schedules & Courses
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch schedules
      const schedRes = await authFetch('/schedule');
      if (!schedRes.ok) throw new Error('Failed to load schedules');
      const schedData = await schedRes.json();
      setSchedules(schedData);

      // Fetch courses (only needed for admin/faculty to populate the dropdown)
      if (user?.role === 'admin' || user?.role === 'faculty') {
        const courseRes = await authFetch('/academics/courses');
        if (!courseRes.ok) throw new Error('Failed to load courses');
        const courseData = await courseRes.json();
        setCourses(courseData);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Form Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Create Schedule Slot
  const handleAddSchedule = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);

    if (!formData.course || !formData.classroom) {
      setModalError('Please fill in all fields.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await authFetch('/schedule', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create schedule slot.');
      }

      setSchedules((prev) => [...prev, data]);
      setIsModalOpen(false);
      // Reset form
      setFormData({
        course: '',
        dayOfWeek: 'Monday',
        startTime: '09:00',
        endTime: '10:30',
        classroom: '',
      });
    } catch (err) {
      setModalError(err.message || 'Error occurred while saving slot.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Schedule Slot
  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule slot?')) return;

    try {
      const res = await authFetch(`/schedule/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete slot.');
      }

      setSchedules((prev) => prev.filter((slot) => slot._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete slot.');
    }
  };

  // Filter schedules by day
  const getSchedulesForDay = (day) => {
    return schedules
      .filter((slot) => slot.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-darkCard/40 backdrop-blur-md p-6 rounded-xl border border-darkBorder/40">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Lecture & Class Timetable</h2>
            <p className="text-sm text-slate-400">
              {user?.role === 'student' && 'View your enrolled weekly class schedules.'}
              {user?.role === 'faculty' && 'Review your assigned lecture slots and classrooms.'}
              {user?.role === 'admin' && 'Monitor and schedule timetables across all courses.'}
            </p>
          </div>
          {(user?.role === 'admin' || user?.role === 'faculty') && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="glass-btn-primary flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Lecture Slot</span>
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* --- DESKTOP GRID VIEW --- */}
        <div className="hidden lg:grid lg:grid-cols-7 gap-4">
          {WEEKDAYS.map((day) => {
            const daySlots = getSchedulesForDay(day);
            return (
              <div key={day} className="flex flex-col min-w-0">
                <div className="text-center font-semibold text-slate-300 py-2 border-b border-darkBorder/40 mb-3 text-sm tracking-wide bg-slate-900/40 rounded-t-lg">
                  {day}
                </div>
                <div className="space-y-3 flex-1">
                  {daySlots.length > 0 ? (
                    daySlots.map((slot) => (
                      <div
                        key={slot._id}
                        className="group relative bg-darkCard/60 backdrop-blur-sm border border-darkBorder/60 rounded-lg p-3 hover:border-primary-500/40 transition-all hover:translate-y-[-2px] duration-200"
                      >
                        <div className="text-xs font-bold text-primary-400 uppercase tracking-wider mb-1">
                          {slot.course?.code}
                        </div>
                        <div className="text-sm font-semibold text-slate-200 line-clamp-2 leading-snug mb-2">
                          {slot.course?.name}
                        </div>
                        
                        <div className="space-y-1 text-xs text-slate-400">
                          <div className="flex items-center space-x-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-500" />
                            <span>{slot.startTime} - {slot.endTime}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-500" />
                            <span className="truncate">{slot.classroom}</span>
                          </div>
                          {user?.role !== 'faculty' && slot.course?.faculty && (
                            <div className="flex items-center space-x-1.5 pt-1">
                              <User className="h-3.5 w-3.5 text-slate-500" />
                              <span className="truncate text-slate-400">{slot.course.faculty.name}</span>
                            </div>
                          )}
                          {(user?.role === 'admin' || user?.role === 'faculty') && (
                            <div className="flex items-center space-x-1.5">
                              <Users className="h-3.5 w-3.5 text-slate-500" />
                              <span>{slot.course?.studentsEnrolled?.length || 0} enrolled</span>
                            </div>
                          )}
                        </div>

                        {/* Delete Trash Button */}
                        {(user?.role === 'admin' || user?.role === 'faculty') && (
                          <button
                            onClick={() => handleDeleteSchedule(slot._id)}
                            className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-slate-900/60 rounded border border-darkBorder/60"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-600 border border-dashed border-darkBorder/20 rounded-lg">
                      No Classes
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* --- MOBILE TABBED VIEW --- */}
        <div className="lg:hidden space-y-4">
          {/* Day selection tabs */}
          <div className="flex overflow-x-auto pb-2 border-b border-darkBorder/40 scrollbar-none gap-2">
            {WEEKDAYS.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-shrink-0 px-4 py-2 text-xs font-semibold rounded-full border transition-all ${
                  selectedDay === day
                    ? 'bg-primary-600/20 text-primary-400 border-primary-500/40'
                    : 'bg-slate-900/30 text-slate-400 border-darkBorder/40 hover:text-slate-200'
                }`}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>

          {/* Slots List */}
          <div className="space-y-3">
            {getSchedulesForDay(selectedDay).length > 0 ? (
              getSchedulesForDay(selectedDay).map((slot) => (
                <div
                  key={slot._id}
                  className="flex justify-between items-center bg-darkCard/60 backdrop-blur-sm border border-darkBorder/60 rounded-xl p-4 hover:border-primary-500/40 transition-all"
                >
                  <div className="space-y-1.5 flex-1 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">
                        {slot.course?.code}
                      </span>
                      <span className="text-xs text-slate-500">|</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                    <div className="text-base font-semibold text-slate-200">
                      {slot.course?.name}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        {slot.classroom}
                      </span>
                      {user?.role !== 'faculty' && slot.course?.faculty && (
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-slate-500" />
                          {slot.course.faculty.name}
                        </span>
                      )}
                      {(user?.role === 'admin' || user?.role === 'faculty') && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-slate-500" />
                          {slot.course?.studentsEnrolled?.length || 0} students
                        </span>
                      )}
                    </div>
                  </div>

                  {(user?.role === 'admin' || user?.role === 'faculty') && (
                    <button
                      onClick={() => handleDeleteSchedule(slot._id)}
                      className="p-2.5 rounded-lg border border-rose-950/20 bg-rose-950/10 text-rose-400 hover:bg-rose-950/30 hover:border-rose-500/40 active:scale-95 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="glass-panel py-12 px-4 text-center">
                <Calendar className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-slate-300">No Lectures Scheduled</h3>
                <p className="text-xs text-slate-500 mt-1">Enjoy your day off!</p>
              </div>
            )}
          </div>
        </div>

        {/* --- ADD SCHEDULE MODAL --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative glass-panel w-full max-w-md p-6 bg-darkCard border border-darkBorder animate-slide-in overflow-hidden">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-darkBorder/40">
                <div className="flex items-center space-x-2 text-primary-400">
                  <Calendar className="h-5 w-5" />
                  <h3 className="text-lg font-bold text-white">Add Timetable Slot</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-xs">
                  {modalError}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleAddSchedule} className="space-y-4">
                {/* Course Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                    Select Course
                  </label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    className="w-full glass-input"
                    required
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Day of Week */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    Day of the Week
                  </label>
                  <select
                    name="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={handleInputChange}
                    className="w-full glass-input"
                    required
                  >
                    {WEEKDAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Timings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full glass-input"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      End Time
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="w-full glass-input"
                      required
                    />
                  </div>
                </div>

                {/* Classroom */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-500" />
                    Classroom / Lecture Hall
                  </label>
                  <input
                    type="text"
                    name="classroom"
                    placeholder="e.g. LHC-101, Lab-3"
                    value={formData.classroom}
                    onChange={handleInputChange}
                    className="w-full glass-input"
                    required
                  />
                </div>

                {/* Submit buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-darkBorder/40">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="glass-btn-secondary py-2"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="glass-btn-primary py-2"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Add Slot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Schedule;
