// src/components/student/MySubmissionsPage.js (Create this new file)
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Adjust path
import api from '../../utils/api'; // Your configured Axios instance

const MySubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchMySubmissions = async () => {
      if (!token || !user) {
        setError("User not authenticated. Please log in.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError('');
      try {
        // You need a backend endpoint like this:
        // GET /api/student/submissions/me OR /api/submissions?studentId=req.user.id
        const response = await api.get('/student/submissions/me'); // Example endpoint
        setSubmissions(response.data || []);
      } catch (err) {
        console.error("Error fetching submissions:", err);
        setError(err.response?.data?.error || err.message || 'Failed to fetch your submissions.');
      }
      setIsLoading(false);
    };

    fetchMySubmissions();
  }, [token, user]);

  if (isLoading) {
    return <div className="container"><p>Loading your submissions...</p></div>;
  }

  if (error) {
    return <div className="container error-message"><p>{error}</p></div>;
  }

  return (
    <div className="container">
      <h2>My Submissions & Grades</h2>
      {submissions.length === 0 ? (
        <p>You haven't made any submissions yet.</p>
      ) : (
        <ul className="item-list">
          {submissions.map((submission) => (
            <li key={submission._id} className="list-item">
              <h3>
                <Link to={`/courses/${submission.course?._id}/assignments/${submission.assignmentDefinition?._id}`}>
                  {submission.assignmentDefinition?.title || 'Assignment Title Missing'}
                </Link>
              </h3>
              <p>
                <strong>Course:</strong> {submission.course?.title || 'Course Name Missing'}
              </p>
              <p>
                <strong>Submitted on:</strong> {new Date(submission.submissionDate).toLocaleString()}
                {submission.isLate && <span style={{ color: 'orange', marginLeft: '10px' }}>(Late)</span>}
              </p>
              {submission.submittedFile && submission.submittedFile.path && (
                <p>
                  <strong>File:</strong>{' '}
                  <a
                    href={`/api/submissions/${submission._id}/download`} // Backend route to download this specific submission file
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {submission.submittedFile.originalName}
                  </a>
                </p>
              )}
              {submission.submissionText && (
                <div className="submission-text-preview">
                    <strong>Text Submission:</strong>
                    <p style={{ maxHeight: '100px', overflowY: 'auto', border: '1px solid #eee', padding: '5px', background: '#f9f9f9'}}>
                        {submission.submissionText}
                    </p>
                </div>
              )}
              <p>
                <strong>Grade:</strong> {submission.grade !== null && submission.grade !== undefined ? `${submission.grade} / ${submission.assignmentDefinition?.pointsPossible || 100}` : 'Not graded yet'}
              </p>
              {submission.instructorFeedback && (
                <p><strong>Feedback:</strong> {submission.instructorFeedback}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MySubmissionsPage;