import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { FileSpreadsheet, Calendar, Upload, CheckCircle2, Download, AlertCircle } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const StudentAssignments = () => {
  const { authFetch, API_BASE } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  // Track file selection per assignment ID
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState('');

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await authFetch('/assignments');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch assignments');
      setAssignments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleFileChange = (assignmentId, file) => {
    setSelectedFiles((prev) => ({ ...prev, [assignmentId]: file }));
  };

  const handleUploadSubmit = async (e, assignmentId) => {
    e.preventDefault();
    const file = selectedFiles[assignmentId];
    if (!file) {
      alert('Please select a file to upload first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingId(assignmentId);
      const token = JSON.parse(localStorage.getItem('acadtrack_user'))?.token;

      const res = await fetch(`${API_BASE}/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to upload assignment');

      setSelectedFiles((prev) => {
        const updated = { ...prev };
        delete updated[assignmentId];
        return updated;
      });

      setUploadSuccess(assignmentId);
      setTimeout(() => setUploadSuccess(''), 3000);
      fetchAssignments();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingId(null);
    }
  };

  // Check if the file actually exists on the server before opening
  const handleDownload = async (fileUrl) => {
    const fullUrl = `${BACKEND_URL}${fileUrl}`;
    try {
      const res = await fetch(fullUrl, { method: 'HEAD' });
      if (!res.ok) {
        alert(
          `File not found on server.\n\nThis usually means the file was replaced by a newer re-submission, or the server's uploads folder was cleared.\n\nPlease re-submit your assignment or contact your instructor.`
        );
        return;
      }
      window.open(fullUrl, '_blank');
    } catch {
      alert('Could not reach the backend server. Make sure it is running on port 5000.');
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

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center space-x-3 p-4 bg-rose-950/20 border border-rose-900/30 text-rose-400 rounded-lg text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      </DashboardLayout>
    );
  }

  const pendingAssignments = assignments.filter((a) => !a.submission);
  const submittedAssignments = assignments.filter((a) => a.submission);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Toggle Tabs */}
        <div className="flex border-b border-darkBorder/40">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-3.5 px-6 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'pending'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending Assignments ({pendingAssignments.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3.5 px-6 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'history'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Submitted & Graded ({submittedAssignments.length})
          </button>
        </div>

        {/* Pending Assignments */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingAssignments.length === 0 ? (
              <Card>
                <div className="text-center py-12 text-slate-400">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500 mb-2" />
                  <h4 className="font-semibold text-slate-300">All Caught Up!</h4>
                  <p className="text-xs mt-1">No pending assignments for your enrolled courses.</p>
                </div>
              </Card>
            ) : (
              pendingAssignments.map((assignment) => (
                <Card
                  key={assignment._id}
                  title={assignment.title}
                  subtitle={`${assignment.course?.code} — ${assignment.course?.name}`}
                  headerAction={
                    <span className="flex items-center space-x-1.5 text-xs text-amber-400 font-semibold bg-amber-950/20 border border-amber-900/30 px-3 py-1 rounded-full">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        Due: {new Date(assignment.dueDate).toLocaleDateString(undefined, {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </span>
                    </span>
                  }
                >
                  <div className="space-y-4">
                    <p className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed">
                      {assignment.description || 'No description provided.'}
                    </p>

                    {assignment.fileUrl && (
                      <button
                        type="button"
                        onClick={() => handleDownload(assignment.fileUrl)}
                        className="flex items-center space-x-1.5 text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors bg-slate-900/60 border border-darkBorder/60 px-3 py-1.5 rounded-lg"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download Worksheet / Syllabus</span>
                      </button>
                    )}

                    <div className="border-t border-darkBorder/30 pt-4">
                      {uploadSuccess === assignment._id && (
                        <div className="mb-3 p-2 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs font-medium flex items-center space-x-2">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Assignment submitted successfully!</span>
                        </div>
                      )}
                      <form
                        onSubmit={(e) => handleUploadSubmit(e, assignment._id)}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3"
                      >
                        <div className="flex-1">
                          <input
                            type="file"
                            required
                            onChange={(e) => handleFileChange(assignment._id, e.target.files[0])}
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                            className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 file:transition-all cursor-pointer"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={uploadingId === assignment._id}
                          className="glass-btn-primary flex items-center justify-center space-x-1.5 text-xs px-4 py-2.5 disabled:opacity-50"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span>{uploadingId === assignment._id ? 'Uploading...' : 'Submit Work'}</span>
                        </button>
                      </form>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Submitted & Graded Assignments */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {submittedAssignments.length === 0 ? (
              <Card>
                <div className="text-center py-12 text-slate-400">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-slate-600 mb-2" />
                  <h4 className="font-semibold text-slate-300">No Submissions Yet</h4>
                  <p className="text-xs mt-1">Assignments you submit will appear here.</p>
                </div>
              </Card>
            ) : (
              submittedAssignments.map((assignment) => {
                const sub = assignment.submission;
                const isGraded = sub.status === 'Graded';

                // Convert internal multer filename to a human-readable name
                // e.g. "file-1780693768631-661407308.pdf" → "submission.pdf"
                const rawFilename = sub.fileUrl?.split('/').pop() || '';
                const ext = rawFilename.split('.').pop();
                const displayName = `submission.${ext}` || 'submission-file';

                return (
                  <Card
                    key={assignment._id}
                    title={assignment.title}
                    subtitle={`${assignment.course?.code} — ${assignment.course?.name}`}
                    headerAction={
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${
                        isGraded
                          ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30'
                          : 'bg-indigo-950/20 text-indigo-400 border-indigo-900/30'
                      }`}>
                        {sub.status}
                      </span>
                    }
                  >
                    <div className="space-y-4">

                      {/* Submission file row */}
                      <div className="p-4 rounded-xl bg-slate-900/40 border border-darkBorder/30 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                        <div className="space-y-1.5">
                          <p className="text-xs text-slate-400 font-semibold">Your Submission File</p>
                          <button
                            type="button"
                            onClick={() => handleDownload(sub.fileUrl)}
                            className="text-xs text-primary-400 hover:text-primary-300 transition-colors inline-flex items-center space-x-1.5 group"
                          >
                            <Download className="h-3.5 w-3.5 group-hover:translate-y-0.5 transition-transform" />
                            <span className="group-hover:underline">{displayName}</span>
                          </button>
                        </div>
                        <div className="text-left sm:text-right text-xs text-slate-500">
                          <span>Submitted on: </span>
                          <span className="font-medium text-slate-300">
                            {new Date(sub.submittedAt).toLocaleString(undefined, {
                              month: 'short', day: 'numeric', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Grading Result */}
                      {isGraded ? (
                        <div className="p-5 rounded-xl bg-slate-900/30 border border-darkBorder/40 border-l-4 border-l-emerald-500 space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-semibold text-slate-200">Grading Evaluation</h5>
                            <div className="text-right">
                              <span className="text-xs text-slate-400">Assigned Grade: </span>
                              <span className="text-sm font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg ml-1">
                                {sub.grade}
                              </span>
                            </div>
                          </div>
                          {sub.feedback && (
                            <div className="space-y-1 pt-1 border-t border-darkBorder/20">
                              <p className="text-xs font-semibold text-slate-400">Faculty Feedback:</p>
                              <p className="text-xs text-slate-300 italic leading-relaxed">
                                "{sub.feedback}"
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-900/20 p-3 rounded-lg border border-darkBorder/20">
                          <AlertCircle className="h-4 w-4 text-slate-600" />
                          <span>Evaluation pending. Your instructor will grade your submission shortly.</span>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentAssignments;
