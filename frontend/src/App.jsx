import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';

// Student pages
import StudentDashboard from './pages/StudentDashboard';
import StudentAcademics from './pages/StudentAcademics';
import StudentAssignments from './pages/StudentAssignments';

// Faculty pages
import FacultyDashboard from './pages/FacultyDashboard';
import FacultyAttendance from './pages/FacultyAttendance';
import FacultyGrades from './pages/FacultyGrades';
import FacultyAssignments from './pages/FacultyAssignments';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import AdminCourses from './pages/AdminCourses';
import AdminUsers from './pages/AdminUsers';
import Schedule from './pages/Schedule';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Student Protected Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/academics"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentAcademics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/assignments"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentAssignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/schedule"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Schedule />
              </ProtectedRoute>
            }
          />

          {/* Faculty Protected Routes */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/attendance"
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/grades"
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyGrades />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/assignments"
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyAssignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/schedule"
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <Schedule />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/schedule"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Schedule />
              </ProtectedRoute>
            }
          />

          {/* Default Redirection */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
