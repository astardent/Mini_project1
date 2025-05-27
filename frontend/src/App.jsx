import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import StudentDashboard from './components/student/StudentDashboard';
import InstructorDashboard from './components/instructor/InstructorDashboard';
import ManageCourses from './components/instructor/ManageCourses';
import ManageAssignments from './components/instructor/ManageAssignments';
import CourseListStudent from './components/student/CourseListStudent';
import SubmitAssignmentForm from './components/student/SubmitAssignmentForm';
import './App.css'; // We'll create this for basic styling
import AssignmentListStudent from './components/student/AssignmentListStudent';
import MySubmissionsPage from './components/student/MySubmissionsPage';
import ViewSubmissionsPage from './components/instructor/ViewSubmissionPage';
import AssignmentSubmissionPage from './components/student/AssignmentSubmissionPage';
import AdminDashboard from './components/admin/AdminDashboard';
import ManageStudentsAdmin from './components/admin/ManageStudentsAdmin';
import ManageCoursesAdmin from './components/admin/ManageCoursesAdmin';
import ManageInstructorsAdmin from './components/admin/ManageInstructorsAdmin';

function AppContent() {
  const { isLoggedIn, role } = React.useContext(AuthContext);

  const getRedirectPath = () => {
    if (role === 'admin') {
      return "/admin/dashboard";
    } else if (role === 'instructor') {
      return "/instructor/dashboard";
    } else if (role === 'student') {
      return "/student/dashboard";
    }
    return "/"; // Default fallback if role is somehow unexpected
  };
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={!isLoggedIn ? <LoginPage /> : <Navigate to={getRedirectPath()} replace />} />
          <Route path="/register" element={!isLoggedIn ? <RegisterPage /> : <Navigate to="/" />} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={isLoggedIn && role === 'student' ? <StudentDashboard /> : <Navigate to="/login" />} />
          <Route path="/student/courses" element={isLoggedIn && role === 'student' ? <CourseListStudent /> : <Navigate to="/login" />} />
          <Route path="/student/assignments" element={isLoggedIn && role === 'student' ? <AssignmentListStudent /> : <Navigate to="/login" />} />
          <Route path="/student/assignments/:assignmentDefId/submit" element={isLoggedIn && role === 'student' ? <AssignmentSubmissionPage /> : <Navigate to="/login" />} />
          <Route path="/student/my-submissions" element={isLoggedIn && role === 'student' ? <MySubmissionsPage/> : <Navigate to="/login" />} />
          {/* Add more student routes, e.g., /student/assignments/:courseId */}


          {/* Instructor Routes */}
          <Route path="/instructor/dashboard" element={isLoggedIn && role === 'instructor' ? <InstructorDashboard /> : <Navigate to="/login" />} />
          <Route path="/instructor/courses" element={isLoggedIn && role === 'instructor' ? <ManageCourses /> : <Navigate to="/login" />} />
          <Route path="/instructor/assignments" element={isLoggedIn && role === 'instructor' ? <ManageAssignments /> : <Navigate to="/login" />} />
          <Route path="/instructor/assignments/:assignmentDefId/submissions" element={isLoggedIn && role === 'instructor' ? <ViewSubmissionsPage /> : <Navigate to="/login" />} />
          {/* Add more instructor routes */}

          {/* adminroutes */}
          <Route path="/admin/dashboard" element={isLoggedIn && role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/admin/manage-students" element={isLoggedIn && role === 'admin' ? <ManageStudentsAdmin /> : <Navigate to="/login" />} />
          <Route path="/admin/manage-instructors" element={isLoggedIn && role === 'admin' ? <ManageInstructorsAdmin /> : <Navigate to="/login" />} />
          <Route path="/admin/manage-courses" element={isLoggedIn && role === 'admin' ? <ManageCoursesAdmin /> : <Navigate to="/login" />} />

          <Route path="*" element={<Navigate to="/" />} /> {/* Fallback for unknown routes */}
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;