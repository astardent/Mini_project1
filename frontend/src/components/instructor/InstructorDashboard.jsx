import React from 'react';
import { Link } from 'react-router-dom';

const InstructorDashboard = () => {
  return (
    <div>
      <h2>Instructor Dashboard</h2>
      <p>Welcome, Instructor!</p>
      <ul>
        <li><Link to="/instructor/courses">Manage Courses</Link></li>
        <li><Link to="/instructor/assignments">Manage Assignments</Link></li>
        {/* Placeholder for viewing submissions */}
        <li>View Student Submissions (Feature to be added)</li>
      </ul>
    </div>
  );
};

export default InstructorDashboard;