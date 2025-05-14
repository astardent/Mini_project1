// src/components/student/AssignmentListStudent.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom'; // If you navigate to a separate submission page
import { AuthContext } from '../../context/AuthContext'; // Adjust path
// import SubmitAssignmentForm from './SubmitAssignmentForm'; // If using a modal

const AssignmentListStudent = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [showSubmitModal, setShowSubmitModal] = useState(false); // For modal approach
  // const [selectedCourseForSubmission, setSelectedCourseForSubmission] = useState(null); // For modal

  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!token || !user) { // Check for user as well if student-specific endpoint is used
        setError("Authentication token or user data not found. Please log in.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Assuming '/api/assignments' fetches assignments submitted BY THIS student
        // The backend should filter based on req.user.id from the token
        const response = await fetch('/api/assignments', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
          throw new Error(errorData.message || `Error ${response.status}: Failed to fetch assignments`);
        }

        const data = await response.json();
        // Ensure data is an array; backend might return empty array or object with assignments key
        setAssignments(Array.isArray(data) ? data : (data.assignments || []));
      } catch (err) {
        console.error("Failed to fetch assignments:", err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [token, user]);

  // const handleOpenSubmitModal = (courseId) => {
  //   setSelectedCourseForSubmission(courseId);
  //   setShowSubmitModal(true);
  // };

  if (loading) {
    return <div className="container"><p>Loading assignments...</p></div>;
  }

  if (error) {
    return <div className="container error-message"><p>Error: {error}</p></div>;
  }

  return (
    <div className="container student-dashboard">
      <h2>Your Submitted Assignments</h2>

      {/* Button to navigate to a general submission page or trigger a modal */}
      {/* This is a simple example; you might have a more context-aware "Submit for Course X" button */}
      <div style={{ marginBottom: '20px' }}>
        <Link to="/student/submit-assignment" className="button primary">
          Submit New Assignment
        </Link>
        {/* Or for modal: */}
        {/* <button onClick={() => handleOpenSubmitModal(null)} className="button primary">
          Submit New Assignment
        </button> */}
      </div>

      {assignments.length === 0 ? (
        <p>No assignments submitted yet.</p>
      ) : (
        <ul className="item-list">
          {assignments.map((assignment) => (
            <li key={assignment._id || assignment.id} className="list-item">
              <h3>{assignment.title}</h3>
              <p><strong>Course:</strong> {assignment.course?.title || assignment.course || 'N/A'}</p>
              <p><strong>Description:</strong> {assignment.description || 'No description.'}</p>
              <p><strong>Submission Date:</strong> {new Date(assignment.submissionDate || assignment.createdAt).toLocaleDateString()}</p>
              {assignment.dueDate && <p><strong>Original Due Date:</strong> {new Date(assignment.dueDate).toLocaleDateString()}</p>}

              {assignment.submittedFile && assignment.submittedFile.path ? (
                <p>
                  <strong>Submitted File:</strong>
                  {/*
                    The backend needs to serve these files.
                    Option 1: Direct link if 'uploads' is served statically and path is relative to public.
                              e.g., http://localhost:3000/uploads/assignments/filename.pdf
                    Option 2: A dedicated backend route to download files.
                              e.g., /api/assignments/download/:filename or /api/assignments/:assignmentId/file
                              This route would use res.download() or stream the file.
                              This is more secure and flexible.
                  */}
                  <a
                    href={`http://localhost:3000/${assignment.submittedFile.path}`} // Adjust if backend serves files differently
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginLeft: '10px'}}
                  >
                    {assignment.submittedFile.originalName} ({Math.round(assignment.submittedFile.size / 1024)} KB)
                  </a>
                </p>
              ) : (
                <p><strong>Submitted File:</strong> No file attached or path missing.</p>
              )}
              {/* Add edit/delete buttons if applicable and authorized */}
            </li>
          ))}
        </ul>
      )}

      {/* {showSubmitModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={() => setShowSubmitModal(false)}>×</span>
            <SubmitAssignmentForm
              courseId={selectedCourseForSubmission}
              onSuccess={() => {
                setShowSubmitModal(false);
                // Optionally re-fetch assignments here
              }}
            />
          </div>
        </div>
      )} */}
    </div>
  );
};

export default AssignmentListStudent;