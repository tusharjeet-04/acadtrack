import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bell, Trash2, Megaphone, Plus, X } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const NoticeBoard = () => {
  const { user, authFetch } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    targetRoles: ['student', 'faculty'],
  });
  const [posting, setPosting] = useState(false);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/notices');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch notices');
      setNotices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) return;

    try {
      setPosting(true);
      const res = await authFetch('/notices', {
        method: 'POST',
        body: JSON.stringify(newNotice),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to post notice');
      }

      setNewNotice({ title: '', content: '', targetRoles: ['student', 'faculty'] });
      setModalOpen(false);
      fetchNotices(); // Refresh notice board
    } catch (err) {
      alert(err.message);
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;

    try {
      const res = await authFetch(`/notices/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete notice');
      }

      setNotices(notices.filter((n) => n._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRoleToggle = (role) => {
    const targets = [...newNotice.targetRoles];
    if (targets.includes(role)) {
      if (targets.length > 1) {
        setNewNotice({
          ...newNotice,
          targetRoles: targets.filter((r) => r !== role),
        });
      }
    } else {
      setNewNotice({
        ...newNotice,
        targetRoles: [...targets, role],
      });
    }
  };

  const canPost = user?.role === 'admin' || user?.role === 'faculty';

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between border-b border-darkBorder/40 pb-4 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-primary-600/10 text-primary-400 rounded-lg">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-100">Notice Board</h3>
            <p className="text-xs text-slate-400">Latest updates and announcements</p>
          </div>
        </div>

        {canPost && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-1.5 bg-primary-600/20 text-primary-400 border border-primary-500/30 hover:bg-primary-600 hover:text-white transition-all text-xs font-semibold px-3 py-2 rounded-lg"
          >
            <Plus className="h-4 w-4" />
            <span>Create Notice</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12">
          <LoadingSpinner size="medium" />
        </div>
      ) : error ? (
        <div className="text-rose-400 text-sm text-center py-4 bg-rose-950/10 border border-rose-900/20 rounded-lg">
          {error}
        </div>
      ) : notices.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Megaphone className="h-10 w-10 mx-auto text-slate-600 mb-2" />
          <p className="text-sm">No notices posted yet</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
          {notices.map((notice) => (
            <div
              key={notice._id}
              className="p-4 rounded-xl bg-slate-900/40 border border-darkBorder/30 hover:border-darkBorder/80 hover:bg-slate-900/70 transition-all flex justify-between items-start"
            >
              <div className="space-y-1.5 flex-1 mr-4">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-sm text-slate-200">{notice.title}</h4>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full capitalize">
                    {notice.author?.role === 'admin' ? 'Admin' : 'Faculty'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed">
                  {notice.content}
                </p>
                <div className="flex items-center space-x-3 text-[10px] text-slate-500">
                  <span>By: {notice.author?.name}</span>
                  <span>•</span>
                  <span>{new Date(notice.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}</span>
                </div>
              </div>

              {(user?.role === 'admin' || notice.author?._id === user?._id) && (
                <button
                  onClick={() => handleDeleteNotice(notice._id)}
                  className="text-slate-500 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-950/20"
                  title="Delete Notice"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Post Notice Dialog Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative glass-panel bg-darkCard border border-darkBorder p-6 max-w-md w-full z-10 animate-fade-in shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-semibold text-slate-100 mb-4">Post New Notice</h3>

            <form onSubmit={handlePostNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Notice Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End Semester Exam Schedule"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full glass-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Content / Announcement
                </label>
                <textarea
                  required
                  rows="4"
                  placeholder="Write the details here..."
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  className="w-full glass-input resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Target Roles
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => handleRoleToggle('student')}
                    className={`flex-1 py-2 px-3 border rounded-lg text-xs font-semibold transition-all ${
                      newNotice.targetRoles.includes('student')
                        ? 'bg-primary-600/20 text-primary-400 border-primary-500'
                        : 'border-darkBorder bg-transparent text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Students
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleToggle('faculty')}
                    className={`flex-1 py-2 px-3 border rounded-lg text-xs font-semibold transition-all ${
                      newNotice.targetRoles.includes('faculty')
                        ? 'bg-primary-600/20 text-primary-400 border-primary-500'
                        : 'border-darkBorder bg-transparent text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Faculty
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 glass-btn-secondary py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className="flex-1 glass-btn-primary py-2 disabled:opacity-50"
                >
                  {posting ? 'Posting...' : 'Post Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
