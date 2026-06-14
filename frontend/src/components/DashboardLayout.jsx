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
  LogOut,
  Menu,
  X,
  ChevronRight,
  Building2,
} from 'lucide-react';

const PAGE_TITLES = {
  academics:   { title: 'Academic Progress',      subtitle: 'Grades, GPA & academic records' },
  attendance:  { title: 'Attendance Manager',     subtitle: 'Mark & track class attendance' },
  grades:      { title: 'Grade Book',             subtitle: 'Enter and manage student grades' },
  assignments: { title: 'Assignments',            subtitle: 'Manage coursework and submissions' },
  courses:     { title: 'Course Management',      subtitle: 'Create and edit course records' },
  users:       { title: 'User Directory',         subtitle: 'Manage students, faculty & admins' },
  schedule:    { title: 'Weekly Timetable',       subtitle: 'Class schedule at a glance' },
};

const DashboardLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate  = useNavigate();
  const location  = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const linksByRole = {
    student: [
      { name: 'Dashboard',       path: '/student',             icon: LayoutDashboard },
      { name: 'Academics',       path: '/student/academics',   icon: GraduationCap },
      { name: 'Assignments',     path: '/student/assignments', icon: FileSpreadsheet },
      { name: 'Timetable',       path: '/student/schedule',    icon: Calendar },
    ],
    faculty: [
      { name: 'Dashboard',       path: '/faculty',             icon: LayoutDashboard },
      { name: 'Attendance',      path: '/faculty/attendance',  icon: Calendar },
      { name: 'Grades',          path: '/faculty/grades',      icon: GraduationCap },
      { name: 'Assignments',     path: '/faculty/assignments', icon: FileSpreadsheet },
      { name: 'Timetable',       path: '/faculty/schedule',    icon: Calendar },
    ],
    admin: [
      { name: 'Dashboard',       path: '/admin',               icon: LayoutDashboard },
      { name: 'Courses',         path: '/admin/courses',       icon: BookOpen },
      { name: 'Users',           path: '/admin/users',         icon: Users },
      { name: 'Schedule',        path: '/admin/schedule',      icon: Calendar },
    ],
  };

  const menuLinks = linksByRole[user?.role] || [];

  // Determine current page meta
  const pathSegment = location.pathname.split('/').filter(Boolean).pop();
  const pageMeta    = PAGE_TITLES[pathSegment] || { title: 'Dashboard', subtitle: 'Overview & quick stats' };
  const isDashboard = location.pathname.split('/').length === 2;
  const currentTitle    = isDashboard ? 'Dashboard'   : pageMeta.title;
  const currentSubtitle = isDashboard ? 'Overview & quick stats' : pageMeta.subtitle;

  const roleColors = {
    admin:   { bg: 'bg-rose-950/50',    text: 'text-rose-400',    border: 'border-rose-900/30' },
    faculty: { bg: 'bg-indigo-950/50',  text: 'text-indigo-400',  border: 'border-indigo-900/30' },
    student: { bg: 'bg-emerald-950/50', text: 'text-emerald-400', border: 'border-emerald-900/30' },
  };
  const rc = roleColors[user?.role] || roleColors.student;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* ── Brand ── */}
      <div className="px-5 py-6 border-b border-darkBorder/60">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="h-5 w-5 text-primary-400" />
          </div>
          <div>
            <span className="text-base font-bold text-gradient-primary tracking-tight">AcadTrack</span>
            <p className="text-[10px] text-slate-600 leading-none mt-0.5">Academic Management</p>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 px-3 mb-2">Navigation</p>
        {menuLinks.map((link) => {
          const Icon     = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${
                isActive
                  ? 'bg-primary-600/15 text-primary-300 border border-primary-700/30'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary-400 rounded-r-full" />
              )}
              <Icon className={`h-4.5 w-4.5 flex-shrink-0 ${isActive ? 'text-primary-400' : 'text-slate-600 group-hover:text-slate-400'}`} style={{width:'18px',height:'18px'}} />
              <span className="flex-1">{link.name}</span>
              {isActive && <ChevronRight className="h-3 w-3 text-primary-500/60" />}
            </Link>
          );
        })}
      </nav>

      {/* ── User Section ── */}
      <div className="px-3 pb-4 border-t border-darkBorder/60 pt-4 space-y-2">
        {/* Role & Dept pills */}
        <div className="px-2 flex items-center gap-2 flex-wrap">
          <span className={`badge ${rc.bg} ${rc.text} border ${rc.border} capitalize`}>
            {user?.role}
          </span>
          {user?.department && (
            <span className="badge bg-slate-900/60 text-slate-500 border border-slate-700/40 text-[10px] truncate max-w-[120px]">
              {user.department}
            </span>
          )}
        </div>

        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-darkSurface border border-darkBorder/60">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-600/40 to-primary-900/40 border border-primary-700/30 flex items-center justify-center text-primary-300 font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-600 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/20 transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-darkBg flex">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-60 flex-shrink-0 flex-col bg-darkCard border-r border-darkBorder/60 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-60 flex flex-col z-10 bg-darkCard border-r border-darkBorder/60 animate-slide-in">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 -right-11 h-9 w-9 rounded-xl bg-darkCard border border-darkBorder/60 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Top Header ── */}
        <header className="sticky top-0 z-40 h-14 flex items-center justify-between px-5 md:px-8 bg-darkBg/80 backdrop-blur-xl border-b border-darkBorder/50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden h-8 w-8 rounded-lg bg-darkSurface border border-darkBorder/60 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div>
              <h1 className="text-sm font-bold text-slate-100 leading-tight">{currentTitle}</h1>
              <p className="text-[10px] text-slate-600 leading-tight hidden sm:block">{currentSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user?.department && (
              <span className="hidden md:flex items-center gap-1.5 text-[10px] text-slate-500 bg-darkSurface border border-darkBorder/60 rounded-lg px-2.5 py-1.5">
                <Building2 className="h-3 w-3" />
                {user.department}
              </span>
            )}
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary-600/40 to-indigo-900/60 border border-primary-700/30 flex items-center justify-center text-primary-300 font-bold text-xs">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 p-5 md:p-8 overflow-y-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
