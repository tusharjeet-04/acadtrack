import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users, Mail, AlertCircle, Pencil, Trash2, X, Save, ShieldAlert } from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration',
  'Administration',
];

// ── Edit Modal ────────────────────────────────────────────────────────────────
const EditUserModal = ({ user, onClose, onSave }) => {
  const [form, setForm] = useState({
    name:       user.name       || '',
    email:      user.email      || '',
    department: user.department || '',
    role:       user.role       || 'student',
    semester:   user.semester   || '',
    studentId:  user.studentId  || '',
    facultyId:  user.facultyId  || '',
  });
  const [saving, setSaving]   = useState(false);
  const [error,  setError]    = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSave(user._id, form);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <div>
            <h2 className="text-base font-bold text-slate-100">Edit User</h2>
            <p className="text-xs text-slate-400 mt-0.5">Update account details for <span className="text-slate-200 font-medium">{user.name}</span></p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} required className="w-full glass-input text-sm" placeholder="Full name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full glass-input text-sm" placeholder="Email address" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Role</label>
              <select name="role" value={form.role} onChange={handleChange} className="w-full glass-input text-sm">
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Department</label>
              <select name="department" value={form.department} onChange={handleChange} className="w-full glass-input text-sm">
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Role-specific fields */}
          {form.role === 'student' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Student ID</label>
                <input name="studentId" value={form.studentId} onChange={handleChange} className="w-full glass-input text-sm" placeholder="e.g. S-2024-401" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Semester</label>
                <select name="semester" value={form.semester} onChange={handleChange} className="w-full glass-input text-sm">
                  <option value="">Select semester</option>
                  {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
            </div>
          )}
          {form.role === 'faculty' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Faculty ID</label>
              <input name="facultyId" value={form.facultyId} onChange={handleChange} className="w-full glass-input text-sm" placeholder="e.g. F-2026-901" />
            </div>
          )}

          {error && (
            <div className="alert-error text-xs mb-4">
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="glass-btn-secondary flex-1 py-2 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="glass-btn-primary flex-1 py-2 text-sm">
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving…' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Delete Confirmation Modal ─────────────────────────────────────────────────
const DeleteModal = ({ user, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await onConfirm(user._id);
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-slate-900 border border-rose-900/40 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center space-y-4">
          <div className="h-14 w-14 mx-auto rounded-full bg-rose-950/30 border border-rose-900/40 flex items-center justify-center">
            <Trash2 className="h-6 w-6 text-rose-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Delete User</h2>
            <p className="text-xs text-slate-400 mt-1">
              Are you sure you want to permanently delete <span className="font-semibold text-slate-200">{user.name}</span>?
              <br />This action <span className="text-rose-400 font-semibold">cannot be undone</span>.
            </p>
          </div>

          {error && (
            <div className="alert-error text-xs mb-2">
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="glass-btn-secondary flex-1 py-2 text-sm">Cancel</button>
            <button onClick={handleDelete} disabled={deleting} className="glass-btn-danger flex-1 py-2 text-sm">
              <Trash2 className="h-4 w-4" />
              <span>{deleting ? 'Deleting…' : 'Delete'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const AdminUsers = () => {
  const { authFetch } = useContext(AuthContext);
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal states
  const [editingUser,  setEditingUser]  = useState(null); // user object | null
  const [deletingUser, setDeletingUser] = useState(null); // user object | null
  const [actionMsg,    setActionMsg]    = useState('');   // success toast

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res  = await authFetch('/auth/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch users list');
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSaveEdit = async (id, form) => {
    const res  = await authFetch(`/auth/users/${id}`, { method: 'PUT', body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update user');
    setEditingUser(null);
    setActionMsg(`✓ ${data.name}'s profile updated successfully.`);
    setTimeout(() => setActionMsg(''), 5000);
    fetchUsers();
  };

  const handleConfirmDelete = async (id) => {
    const res  = await authFetch(`/auth/users/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete user');
    setDeletingUser(null);
    setActionMsg(`✓ User deleted successfully.`);
    setTimeout(() => setActionMsg(''), 5000);
    fetchUsers();
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.studentId && u.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.facultyId && u.facultyId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
        <div className="p-4 bg-rose-950/20 border border-rose-900/30 text-rose-400 rounded-lg">{error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Modals */}
      {editingUser  && <EditUserModal   user={editingUser}  onClose={() => setEditingUser(null)}  onSave={handleSaveEdit}      />}
      {deletingUser && <DeleteModal     user={deletingUser} onClose={() => setDeletingUser(null)} onConfirm={handleConfirmDelete} />}

      <div className="space-y-6">
        {/* Success toast */}
        {actionMsg && (
          <div className="alert-success text-sm">
            <span>{actionMsg}</span>
          </div>
        )}

        {/* Directory Controls */}
        <Card title="User Directories" subtitle="Manage registered student, faculty and administrator listings">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-1">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email, roll ID or faculty ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full glass-input text-xs"
              />
            </div>
            <div className="w-full sm:w-48">
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full glass-input text-xs">
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Administrators</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Directory Listing Table */}
        <Card title="System Registered Users" subtitle={`${filteredUsers.length} users found`}>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-14">
              <AlertCircle className="h-8 w-8 mx-auto text-slate-700 mb-3" />
              <p className="text-sm text-slate-500">No accounts matching the filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="pro-table">
                <thead>
                  <tr>
                    <th className="px-6">Name</th>
                    <th className="px-6">Email</th>
                    <th className="px-6 text-center">Role</th>
                    <th className="px-6 text-center">ID</th>
                    <th className="px-6">Department</th>
                    <th className="px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-800/60 to-primary-950/60 border border-primary-700/30 flex items-center justify-center font-bold text-primary-300 text-xs flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-200 text-sm">{user.name}</div>
                            {user.role === 'student' && user.semester && (
                              <div className="text-[10px] text-slate-600">Semester {user.semester}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-slate-600 flex-shrink-0" />
                          <span className="text-xs text-slate-400 truncate max-w-[180px]">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 text-center">
                        <span className={`badge ${
                          user.role === 'admin'   ? 'badge-danger' :
                          user.role === 'faculty' ? 'badge-primary' :
                                                    'badge-success'
                        }`}>{user.role}</span>
                      </td>
                      <td className="px-6 text-center">
                        <span className="font-mono text-xs text-slate-400">
                          {user.role === 'student' ? user.studentId : user.role === 'faculty' ? user.facultyId : '—'}
                        </span>
                      </td>
                      <td className="px-6 text-xs text-slate-500">
                        {user.department || 'General'}
                      </td>
                      <td className="px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingUser(user)}
                            title="Edit user"
                            className="h-7 w-7 rounded-lg bg-primary-950/50 border border-primary-800/30 text-primary-400 hover:bg-primary-900/50 hover:border-primary-700/40 transition-all flex items-center justify-center"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingUser(user)}
                            title="Delete user"
                            className="h-7 w-7 rounded-lg bg-rose-950/50 border border-rose-900/30 text-rose-400 hover:bg-rose-900/50 hover:border-rose-800/40 transition-all flex items-center justify-center"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
