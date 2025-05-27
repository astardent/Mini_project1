// frontend/src/components/admin/AdminDashboard.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      <p>Welcome, {user?.name || 'Admin'}!</p>
      <ul className="dashboard-links">
        <li><Link to="/admin/manage-students">Manage Students</Link></li>
        <li><Link to="/admin/manage-instructors">Manage Instructors</Link></li>
        <li><Link to="/admin/manage-courses">Manage Courses</Link></li>
        {/* Add more admin functionalities as needed */}
      </ul>
    </div>
  );
};
export default AdminDashboard;