import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { GraduationCap, Award, Percent } from 'lucide-react';

const StudentAcademics = () => {
  const { authFetch } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(null);

  useEffect(() => {
    const fetchAcademicData = async () => {
      try {
        setLoading(true);
        const res = await authFetch('/academics/records');
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch academic history');
        
        setRecords(data);
        if (data.length > 0) {
          // Default to the highest (most recent) semester record
          setSelectedSemester(data[data.length - 1].semester);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAcademicData();
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

  // Find the selected semester's record
  const activeRecord = records.find((r) => r.semester === selectedSemester);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {records.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-slate-400">
              <GraduationCap className="h-12 w-12 mx-auto text-slate-600 mb-2" />
              <h4 className="font-semibold text-slate-300">No Grades Recorded Yet</h4>
              <p className="text-xs mt-1">Your faculty has not uploaded grades for any semester yet.</p>
            </div>
          </Card>
        ) : (
          <>
            {/* Semester Tabs Navigation */}
            <div className="flex border-b border-darkBorder/40 overflow-x-auto pb-px">
              {records.map((r) => (
                <button
                  key={r.semester}
                  onClick={() => setSelectedSemester(r.semester)}
                  className={`py-3.5 px-6 font-semibold text-sm transition-all border-b-2 flex-shrink-0 ${
                    selectedSemester === r.semester
                      ? 'border-primary-500 text-primary-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Semester {r.semester}
                </button>
              ))}
            </div>

            {/* Semester GPA Stats */}
            {activeRecord && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="stat-card">
                  <div className="stat-icon bg-primary-950/60 text-primary-400">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Semester SGPA</p>
                    <p className="text-2xl font-bold text-slate-100">{activeRecord.sgpa.toFixed(2)}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon bg-emerald-950/60 text-emerald-400">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Cumulative CGPA</p>
                    <p className="text-2xl font-bold text-slate-100">{activeRecord.cgpa.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Grades Table Card */}
            {activeRecord && (
              <Card
                title={`Course Grade Sheet — Semester ${selectedSemester}`}
                subtitle="Detailed breakdown of grade points and marks per registered subject"
              >
                <div className="overflow-x-auto -mx-6">
                  <table className="pro-table">
                    <thead>
                      <tr>
                        <th className="pl-6">Subject Code</th>
                        <th>Subject Title</th>
                        <th className="text-center">Credits</th>
                        <th className="text-center">Marks Obtain</th>
                        <th className="text-center">Letter Grade</th>
                        <th className="text-center pr-6">Grade Point</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeRecord.courses.map((entry) => (
                        <tr key={entry.course?._id || Math.random().toString()}>
                          <td className="pl-6 font-semibold text-slate-200">
                            {entry.course?.code || 'N/A'}
                          </td>
                          <td>{entry.course?.name || 'Deleted Course'}</td>
                          <td className="text-center font-medium">
                            {entry.course?.credits || 3}
                          </td>
                          <td className="text-center font-medium text-slate-200">
                            {entry.marksObtained} / 100
                          </td>
                          <td className="text-center">
                            <span className={`badge ${
                              entry.grade === 'O' ? 'badge-primary' :
                              entry.grade === 'A+' || entry.grade === 'A' ? 'badge-success' :
                              entry.grade === 'F' ? 'badge-danger animate-pulse' :
                              'badge-neutral'
                            }`}>
                              {entry.grade}
                            </span>
                          </td>
                          <td className="text-center font-bold text-slate-200 pr-6">
                            {entry.gradePoints}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentAcademics;
