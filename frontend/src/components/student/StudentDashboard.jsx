// src/components/student/StudentDashboard.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Adjust path if necessary

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="container"> {/* Added container for consistent styling */}
      <h2>Student Dashboard</h2>
      {user ? (
        <p>Welcome, {user.name}!</p>
      ) : (
        <p>Loading user information...</p>
      )}
      <ul className="dashboard-links"> {/* Added a class for styling links */}
        <li>
          <Link to="/student/courses">View Courses & Assignments</Link>
        </li>
        <li>
          <Link to="/student/my-submissions">View My Submissions & Grades</Link> {/* Changed this line */}
        </li>
        {/* Add other relevant links here */}
      </ul>
    </div>
  );
};

export default StudentDashboard;