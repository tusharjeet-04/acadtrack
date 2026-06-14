import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/Card';
import ChartContainer from '../components/ChartContainer';
import NoticeBoard from '../components/NoticeBoard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users, GraduationCap, BookOpen, Layers, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

const StatCard = ({ icon: Icon, label, value, iconBg, iconColor }) => (
  <div className="stat-card">
    <div className={`stat-icon ${iconBg}`}>
      <Icon className={`h-5 w-5 ${iconColor}`} />
    </div>
    <div>
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { authFetch } = useContext(AuthContext);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const res  = await authFetch('/dashboard/admin');
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch admin stats');
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout>
      <div className="alert-error">{error}</div>
    </DashboardLayout>
  );

  const chartData = stats.deptDistribution.map((dept, i) => ({
    name: dept._id ? dept._id.split(' ')[0] : 'General',
    fullName: dept._id || 'General',
    count: dept.count,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div className="glass-panel p-3 text-xs">
          <p className="font-semibold text-slate-200 mb-0.5">{payload[0].payload.fullName}</p>
          <p className="text-primary-400">{payload[0].value} students</p>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={GraduationCap} label="Students" value={stats.studentCount}
            iconBg="bg-primary-950/60" iconColor="text-primary-400" />
          <StatCard icon={Users} label="Faculty" value={stats.facultyCount}
            iconBg="bg-indigo-950/60" iconColor="text-indigo-400" />
          <StatCard icon={BookOpen} label="Courses" value={stats.courseCount}
            iconBg="bg-emerald-950/60" iconColor="text-emerald-400" />
          <StatCard icon={Layers} label="Departments" value={stats.deptDistribution.length}
            iconBg="bg-amber-950/60" iconColor="text-amber-400" />
        </div>

        {/* ── Charts + Notices ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <NoticeBoard />
          </div>
          <div className="lg:col-span-2">
            <ChartContainer
              title="Enrollment by Department"
              subtitle="Student headcount across all departments"
            >
              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-600 text-sm">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2438" vertical={false} />
                    <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                    <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={50}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} fillOpacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
