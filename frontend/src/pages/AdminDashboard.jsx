import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/Card';
import ChartContainer from '../components/ChartContainer';
import NoticeBoard from '../components/NoticeBoard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users, GraduationCap, BookOpen, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const { authFetch } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const res = await authFetch('/dashboard/admin');
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-4 bg-rose-950/20 border border-rose-900/30 text-rose-400 rounded-lg">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  // Format department aggregation details for Recharts
  const chartData = stats.deptDistribution.map((dept) => ({
    name: dept._id || 'General',
    count: dept.count,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="flex items-center space-x-4">
            <div className="p-3.5 bg-primary-600/15 text-primary-400 rounded-xl">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Students Registered</p>
              <h4 className="text-2xl font-bold text-slate-100">{stats.studentCount}</h4>
            </div>
          </Card>

          <Card className="flex items-center space-x-4">
            <div className="p-3.5 bg-indigo-600/15 text-indigo-400 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Faculty Members</p>
              <h4 className="text-2xl font-bold text-slate-100">{stats.facultyCount}</h4>
            </div>
          </Card>

          <Card className="flex items-center space-x-4">
            <div className="p-3.5 bg-emerald-600/15 text-emerald-400 rounded-xl">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Courses Active</p>
              <h4 className="text-2xl font-bold text-slate-100">{stats.courseCount}</h4>
            </div>
          </Card>

          <Card className="flex items-center space-x-4">
            <div className="p-3.5 bg-amber-600/15 text-amber-400 rounded-xl">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Departments</p>
              <h4 className="text-2xl font-bold text-slate-100">{stats.deptDistribution.length}</h4>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notice Board Panel */}
          <div className="lg:col-span-1">
            <NoticeBoard />
          </div>

          {/* Department distribution Bar Chart */}
          <div className="lg:col-span-2">
            <ChartContainer
              title="Student Enrollment by Department"
              subtitle="Comparison of headcount across colleges of engineering"
            >
              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                  No department distribution data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#151c2c',
                        borderColor: '#1e293b',
                        borderRadius: '8px',
                        color: '#f8fafc',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Headcount"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={45}
                    />
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
