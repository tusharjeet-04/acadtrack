import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/Card';
import ChartContainer from '../components/ChartContainer';
import NoticeBoard from '../components/NoticeBoard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts';
import { CheckCircle2, XCircle, Award, BookOpen, Clock, AlertTriangle } from 'lucide-react';

const StudentDashboard = () => {
  const { authFetch } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await authFetch('/dashboard/student');
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch student data');
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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

  const { summary, eligibilityDetails, gpaTrend, subjectAttendance } = stats;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="stat-icon bg-primary-950/60"><Award className="h-5 w-5 text-primary-400" /></div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Cumulative CGPA</p>
              <p className="text-2xl font-bold text-slate-100">{summary.cgpa.toFixed(2)}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-indigo-950/60"><Clock className="h-5 w-5 text-indigo-400" /></div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Attendance</p>
              <p className="text-2xl font-bold text-slate-100">{summary.overallAttendance}%</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-amber-950/60"><AlertTriangle className="h-5 w-5 text-amber-400" /></div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Backlogs</p>
              <p className={`text-2xl font-bold ${summary.backlogCount > 0 ? 'text-amber-400' : 'text-slate-100'}`}>{summary.backlogCount}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-emerald-950/60"><BookOpen className="h-5 w-5 text-emerald-400" /></div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Credits Earned</p>
              <p className="text-2xl font-bold text-slate-100">{summary.totalCredits}</p>
            </div>
          </div>
        </div>

        {/* Dynamic Placement Checker widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card
              title="Placement Drive Eligibility"
              subtitle="Real-time check based on college placement criteria"
              className="h-full flex flex-col justify-between"
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 py-2">
                {/* Result Indicator Badge */}
                <div className={`p-6 rounded-2xl flex flex-col items-center justify-center text-center w-full sm:w-48 ${
                  eligibilityDetails.isEligible 
                    ? 'bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/5' 
                    : 'bg-rose-950/20 border border-rose-500/30 text-rose-400 shadow-lg shadow-rose-500/5'
                }`}>
                  {eligibilityDetails.isEligible ? (
                    <>
                      <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-2 animate-bounce" />
                      <span className="text-base font-bold uppercase tracking-wider">Eligible</span>
                      <span className="text-[10px] text-emerald-400/80 mt-1">Ready for Drives</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-12 w-12 text-rose-500 mb-2" />
                      <span className="text-base font-bold uppercase tracking-wider">Ineligible</span>
                      <span className="text-[10px] text-rose-400/80 mt-1">Requires Updates</span>
                    </>
                  )}
                </div>

                {/* Specific criteria checks */}
                <div className="flex-1 space-y-4 w-full">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-darkSurface border border-darkBorder/60">
                    <div className="flex items-center space-x-2">
                      {eligibilityDetails.criteria.cgpa.status ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-400" />
                      )}
                      <span className="text-sm text-slate-300">CGPA Requirement (&ge; 7.00)</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-200">
                      {eligibilityDetails.criteria.cgpa.value.toFixed(2)} / 7.00
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-darkSurface border border-darkBorder/60">
                    <div className="flex items-center space-x-2">
                      {eligibilityDetails.criteria.attendance.status ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-400" />
                      )}
                      <span className="text-sm text-slate-300">Attendance Threshold (&ge; 75%)</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-200">
                      {eligibilityDetails.criteria.attendance.value}% / 75%
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-darkSurface border border-darkBorder/60">
                    <div className="flex items-center space-x-2">
                      {eligibilityDetails.criteria.backlogs.status ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-400" />
                      )}
                      <span className="text-sm text-slate-300">Active Backlogs (=== 0)</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-200">
                      {eligibilityDetails.criteria.backlogs.value} Backlogs
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 mt-4 leading-relaxed border-t border-darkBorder/30 pt-3">
                *Placement eligibility requirements are determined by the college academic cell. Ineligibility restricts the student profile from appearing in active recruiter portals.
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <NoticeBoard />
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CGPA & SGPA Trend Area Chart */}
          <ChartContainer
            title="Academic CGPA & SGPA Trend"
            subtitle="Semester-wise GPA progress tracker"
          >
            {gpaTrend.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                No semester GPA history available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={gpaTrend}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCgpa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSgpa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                  <XAxis dataKey="semester" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151c2c',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#f8fafc',
                    }}
                  />
                  <Area
                    type="monotone"
                    name="CGPA"
                    dataKey="cgpa"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCgpa)"
                  />
                  <Area
                    type="monotone"
                    name="SGPA"
                    dataKey="sgpa"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSgpa)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartContainer>

          {/* Subject Attendance Bar Chart */}
          <ChartContainer
            title="Subject-wise Attendance Rates"
            subtitle="Percentage of attendance marked per course"
          >
            {subjectAttendance.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                No attendance logs found
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={subjectAttendance}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                  <XAxis dataKey="courseCode" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151c2c',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#f8fafc',
                    }}
                  />
                  <Bar
                    dataKey="percentage"
                    name="Attendance %"
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={45}
                  />
                  <ReferenceLine
                    y={75}
                    label={{
                      value: '75% Threshold',
                      position: 'top',
                      fill: '#f43f5e',
                      fontSize: 9,
                      fontWeight: 600,
                    }}
                    stroke="#f43f5e"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
