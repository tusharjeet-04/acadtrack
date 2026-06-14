import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/Card';
import NoticeBoard from '../components/NoticeBoard';
import LoadingSpinner from '../components/LoadingSpinner';
import { BookOpen, Users, FileSpreadsheet, CheckSquare, Calendar, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const FacultyDashboard = () => {
  const { authFetch } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        setLoading(true);
        const res = await authFetch('/dashboard/faculty');
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch faculty stats');
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) return (
    <DashboardLayout>
      <div className="alert-error">{error}</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="stat-icon bg-primary-950/60"><BookOpen className="h-5 w-5 text-primary-400" /></div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Courses Taught</p>
              <p className="text-2xl font-bold text-slate-100">{stats.coursesCount}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-indigo-950/60"><Users className="h-5 w-5 text-indigo-400" /></div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Students</p>
              <p className="text-2xl font-bold text-slate-100">{stats.studentsCount}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-emerald-950/60"><FileSpreadsheet className="h-5 w-5 text-emerald-400" /></div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Assignments</p>
              <p className="text-2xl font-bold text-slate-100">{stats.assignmentsCount}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-rose-950/60"><CheckSquare className="h-5 w-5 text-rose-400" /></div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Pending Grading</p>
              <p className={`text-2xl font-bold ${stats.pendingGradingCount > 0 ? 'text-rose-400' : 'text-slate-100'}`}>{stats.pendingGradingCount}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Action Links */}
          <div className="lg:col-span-1 space-y-6">
            <Card title="Quick Action Console" subtitle="Administrative and academic tools">
              <div className="space-y-3 pt-1">
                <Link
                  to="/faculty/attendance"
                  className="flex items-center justify-between p-3.5 rounded-lg bg-slate-900/40 border border-darkBorder/40 hover:bg-slate-900/80 hover:border-primary-500/35 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-indigo-400" />
                    <span className="text-sm font-medium text-slate-200">Mark Attendance</span>
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-primary-400 transition-colors">&rarr;</span>
                </Link>

                <Link
                  to="/faculty/grades"
                  className="flex items-center justify-between p-3.5 rounded-lg bg-slate-900/40 border border-darkBorder/40 hover:bg-slate-900/80 hover:border-primary-500/35 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="h-5 w-5 text-primary-400" />
                    <span className="text-sm font-medium text-slate-200">Gradebook Entries</span>
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-primary-400 transition-colors">&rarr;</span>
                </Link>

                <Link
                  to="/faculty/assignments"
                  className="flex items-center justify-between p-3.5 rounded-lg bg-slate-900/40 border border-darkBorder/40 hover:bg-slate-900/80 hover:border-primary-500/35 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                    <span className="text-sm font-medium text-slate-200">Manage Assignments</span>
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-primary-400 transition-colors">&rarr;</span>
                </Link>
              </div>
            </Card>
          </div>

          {/* Bulletin Board */}
          <div className="lg:col-span-2">
            <NoticeBoard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;
