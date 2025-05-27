// src/components/student/MySubmissionsPage.jsx
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
        const response = await api.get('/assignments/submissions/me');
        setSubmissions(response.data || []);
      } catch (err) {
        console.error("Error fetching submissions:", err);
        setError(err.response?.data?.error || err.message || 'Failed to fetch your submissions.');
      }
      setIsLoading(false);
    };

    if (token && user) {
        fetchMySubmissions();
    } else {
        setError("User not authenticated. Please log in.");
        setIsLoading(false);
    }
  }, [token, user]);

  const handleDownloadFile = async (submissionId, originalName) => {
    if (!token) {
        alert("Authentication error. Please log in again.");
        return;
    }
    try {
        // Use your api instance which has the interceptor for the token
        const response = await api.get(
            // The backend route GET /api/assignments/submissions/:submissionId/download
            // should handle authorization for both student (owner) and instructor
            `/assignments/submissions/${submissionId}/download`,
            {
                responseType: 'blob', // Important: tell Axios to expect a binary blob
            }
        );

        const fileURL = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = fileURL;
        link.setAttribute('download', originalName || 'submitted-file');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(fileURL);

    } catch (err) {
        console.error("Error downloading file:", err);
        const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to download file.";
        // Attempt to parse error if it's a blob that's actually JSON
        if (err.response && err.response.data instanceof Blob && err.response.data.type.toLowerCase().indexOf('json') !== -1) {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const errorJson = JSON.parse(reader.result);
                    alert(errorJson.message || errorJson.error || "Download failed.");
                } catch (parseError) {
                    alert("Download failed. Could not parse error response.");
                }
            };
            reader.onerror = () => {
                alert("Download failed. Error reading server response.");
            };
            reader.readAsText(err.response.data);
        } else {
            alert(errorMessage);
        }
    }
  };


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
            <li key={submission._id} className="list-item submission-item">
              <h3>
                <Link to={`/student/assignments/${submission.assignmentDefinition?._id}/details`}> {/* Adjust link if needed */}
                  {submission.assignmentDefinition?.title || 'Assignment Title Missing'}
                </Link>
              </h3>
              <p>
                <strong>Course:</strong> {submission.course?.title || submission.course?.coursename || 'Course Name Missing'}
              </p>
              <p>
                <strong>Submitted on:</strong> {new Date(submission.submissionDate).toLocaleString()}
                {submission.isLate && <span className="status-late">(Late)</span>}
              </p>
              {submission.submittedFile && submission.submittedFile.path && (
                <p>
                  <strong>My Submitted File:</strong>{' '}
                  <button
                    onClick={() => handleDownloadFile(submission._id, submission.submittedFile.originalName)}
                    className="button-link" // Style as a link
                  >
                    {submission.submittedFile.originalName}
                  </button>
                </p>
              )}
              {submission.submissionText && (
                <div className="submission-text-preview">
                    <strong>My Text Submission:</strong>
                    <pre>{submission.submissionText}</pre>
                </div>
              )}
              <div className="grade-feedback-section">
                <h4>Grade & Feedback</h4>
                {submission.grade !== null && submission.grade !== undefined ? (
                  <>
                    <p className="grade-display">
                      <strong>Grade:</strong> {submission.grade} / {submission.assignmentDefinition?.pointsPossible || 100}
                    </p>
                    {submission.instructorFeedback ? (
                      <p className="feedback-display">
                        <strong>Feedback:</strong> {submission.instructorFeedback}
                      </p>
                    ) : (
                      <p className="feedback-display">No feedback provided yet.</p>
                    )}
                  </>
                ) : (
                  <p>Not graded yet.</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MySubmissionsPage;