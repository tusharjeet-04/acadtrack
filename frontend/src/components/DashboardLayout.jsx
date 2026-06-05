import React, { useContext, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  GraduationCap,
  Calendar,
  FileSpreadsheet,
  Users,
  BookOpen,
  Bell,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define sidebar links based on role
  const linksByRole = {
    student: [
      { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
      { name: 'Academics & Grades', path: '/student/academics', icon: GraduationCap },
      { name: 'Assignments', path: '/student/assignments', icon: FileSpreadsheet },
    ],
    faculty: [
      { name: 'Dashboard', path: '/faculty', icon: LayoutDashboard },
      { name: 'Mark Attendance', path: '/faculty/attendance', icon: Calendar },
      { name: 'Enter Grades', path: '/faculty/grades', icon: GraduationCap },
      { name: 'Manage Assignments', path: '/faculty/assignments', icon: FileSpreadsheet },
    ],
    admin: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { name: 'Manage Courses', path: '/admin/courses', icon: BookOpen },
      { name: 'Manage Users', path: '/admin/users', icon: Users },
    ],
  };

  const menuLinks = linksByRole[user?.role] || [];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-darkCard/80 backdrop-blur-lg border-r border-darkBorder/60 p-4">
      {/* Brand logo */}
      <div className="flex items-center space-x-3 px-3 py-5 border-b border-darkBorder/40 mb-6">
        <GraduationCap className="h-8 w-8 text-primary-500" />
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-primary-400 bg-clip-text text-transparent">
          AcadTrack
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1">
        {menuLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-600/20 text-primary-400 border-l-4 border-primary-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-darkBorder/40 pt-4 mt-auto">
        <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-slate-900/50 mb-3 border border-darkBorder/20">
          <div className="h-9 w-9 rounded-full bg-primary-600/30 flex items-center justify-center text-primary-400 font-semibold border border-primary-500/20">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-darkBg flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 max-w-xs flex-1 flex flex-col z-10 animate-slide-in">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-[-45px] text-white hover:text-slate-300 focus:outline-none"
            >
              <X className="h-8 w-8" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-darkBg/60 backdrop-blur-md border-b border-darkBorder/40 h-16 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-800/40 mr-2"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg md:text-xl font-semibold text-slate-200">
              {location.pathname.includes('academics') && 'Academic Progress'}
              {location.pathname.includes('attendance') && 'Attendance Manager'}
              {location.pathname.includes('grades') && 'Grade Book'}
              {location.pathname.includes('assignments') && 'Assignments Panel'}
              {location.pathname.includes('courses') && 'Course Management'}
              {location.pathname.includes('users') && 'User Directory'}
              {location.pathname.split('/').length === 2 && 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-600/10 text-primary-400 border border-primary-500/20 capitalize">
              Role: {user?.role}
            </span>
            {user?.department && (
              <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 truncate">
                Dept: {user.department}
              </span>
            )}
            <div className="h-8 w-px bg-darkBorder/40 hidden sm:block"></div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">{user?.email}</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
