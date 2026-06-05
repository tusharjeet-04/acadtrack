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
                <Card className="flex items-center space-x-4 border-l-4 border-l-primary-500">
                  <div className="p-3 bg-primary-600/10 text-primary-400 rounded-xl">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Semester SGPA</p>
                    <h4 className="text-2xl font-bold text-slate-100">{activeRecord.sgpa.toFixed(2)}</h4>
                  </div>
                </Card>

                <Card className="flex items-center space-x-4 border-l-4 border-l-emerald-500">
                  <div className="p-3 bg-emerald-600/10 text-emerald-400 rounded-xl">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Cumulative CGPA</p>
                    <h4 className="text-2xl font-bold text-slate-100">{activeRecord.cgpa.toFixed(2)}</h4>
                  </div>
                </Card>
              </div>
            )}

            {/* Grades Table Card */}
            {activeRecord && (
              <Card
                title={`Course Grade Sheet — Semester ${selectedSemester}`}
                subtitle="Detailed breakdown of grade points and marks per registered subject"
              >
                <div className="overflow-x-auto -mx-6">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-darkBorder/40 bg-slate-900/40 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <th className="py-3 px-6">Subject Code</th>
                        <th className="py-3 px-6">Subject Title</th>
                        <th className="py-3 px-6 text-center">Credits</th>
                        <th className="py-3 px-6 text-center">Marks Obtain</th>
                        <th className="py-3 px-6 text-center">Letter Grade</th>
                        <th className="py-3 px-6 text-center">Grade Point</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-darkBorder/30">
                      {activeRecord.courses.map((entry) => (
                        <tr
                          key={entry.course?._id || Math.random().toString()}
                          className="hover:bg-slate-900/20 text-sm text-slate-300 transition-colors"
                        >
                          <td className="py-4 px-6 font-semibold text-slate-200">
                            {entry.course?.code || 'N/A'}
                          </td>
                          <td className="py-4 px-6">{entry.course?.name || 'Deleted Course'}</td>
                          <td className="py-4 px-6 text-center font-medium">
                            {entry.course?.credits || 3}
                          </td>
                          <td className="py-4 px-6 text-center font-medium text-slate-200">
                            {entry.marksObtained} / 100
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              entry.grade === 'O' ? 'bg-purple-950/30 text-purple-400 border border-purple-500/20' :
                              entry.grade === 'A+' || entry.grade === 'A' ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/20' :
                              entry.grade === 'F' ? 'bg-rose-950/30 text-rose-400 border border-rose-500/20 animate-pulse' :
                              'bg-slate-800 text-slate-300 border border-slate-700/50'
                            }`}>
                              {entry.grade}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center font-bold text-slate-200">
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
