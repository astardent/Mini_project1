// frontend/src/components/instructor/InstructorDashboard.jsx
import React, { useContext } from 'react'; // Added useContext
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Adjust path

const InstructorDashboard = () => {
  const { user } = useContext(AuthContext); // Get user for welcome message

  return (
    <div className="container">
      <h2>Instructor Dashboard</h2>
      {user ? (
        <p>Welcome, {user.name || 'Instructor'}!</p>
      ) : (
        <p>Welcome, Instructor!</p>
      )}
      <ul className="dashboard-links">
        <li>
          <Link to="/instructor/courses">Manage Courses</Link>
        </li>
        <li>
          <Link to="/instructor/assignments">Manage & View Assignment Submissions</Link>
        </li>
        {/* You could add more specific links here later if needed, e.g.,
        <li><Link to="/instructor/grading-queue">Grading Queue</Link></li>
        */}
      </ul>
    </div>
  );
};

export default InstructorDashboard;