import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom'; // <<< IMPORT useParams HERE
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext'; // Adjust path if needed
import Modal from '../common/Modal'; // Your modal component
  const ViewSubmissionsPage = () => {
      const { assignmentDefId } = useParams(); // Get ID from URL
      const [submissions, setSubmissions] = useState([]);
      const [assignmentDef, setAssignmentDef] = useState(null);
      const [isLoading, setIsLoading] = useState(true);
      const [error, setError] = useState('');
      const { token } = useContext(AuthContext);

      const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
      const [currentSubmissionToGrade, setCurrentSubmissionToGrade] = useState(null);
      const [grade, setGrade] = useState('');
      const [feedback, setFeedback] = useState('');
      const [gradingError, setGradingError] = useState('');


      const fetchSubmissions = async () => {
          if (!token) return;
          setIsLoading(true);
          setError('');
          try {
              // Fetch assignment definition details for context
              const defResponse = await api.get(`/assignments/${assignmentDefId}`);
              setAssignmentDef(defResponse.data);

              // Fetch submissions for this assignment definition
              const subResponse = await api.get(`/assignments/${assignmentDefId}/submissions`);
              setSubmissions(subResponse.data || []);
          } catch (err) {
              console.error("Error fetching data:", err);
              setError(err.response?.data?.error || err.message || 'Failed to fetch submissions.');
          }
          setIsLoading(false);
      };

      useEffect(() => {
          fetchSubmissions();
      }, [assignmentDefId, token]);

      const openGradingModal = (submission) => {
          setCurrentSubmissionToGrade(submission);
          setGrade(submission.grade !== null && submission.grade !== undefined ? submission.grade.toString() : '');
          setFeedback(submission.instructorFeedback || '');
          setGradingError('');
          setIsGradingModalOpen(true);
      };

      const handleGradeSubmit = async (e) => {
          e.preventDefault();
          if (grade === '' || feedback === '') {
              setGradingError('Grade and feedback are required.');
              return;
          }
          setGradingError('');
          try {
              await api.put(`/assignments/submissions/${currentSubmissionToGrade._id}/grade`, {
                  grade: parseFloat(grade),
                  feedback,
              });
              setIsGradingModalOpen(false);
              fetchSubmissions(); // Re-fetch to show updated grade
          } catch (err) {
              setGradingError(err.response?.data?.error || err.message || 'Failed to submit grade.');
          }
      };
      const handleDownloadFile = async (submissionId, originalName) => {
    try {
        // Use your api instance which has the interceptor for the token
        const response = await api.get(
            `/assignments/submissions/${submissionId}/download`,
            {
                responseType: 'blob', // Important: tell Axios to expect a binary blob
            }
        );

        // Create a URL for the blob
        const fileURL = window.URL.createObjectURL(new Blob([response.data]));
        // Create a temporary link element to trigger the download
        const link = document.createElement('a');
        link.href = fileURL;
        link.setAttribute('download', originalName || 'downloaded-file'); // Use original name
        document.body.appendChild(link);
        link.click();

        // Clean up by revoking the object URL and removing the link
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(fileURL);

    } catch (err) {
        console.error("Error downloading file:", err);
        // You might want to display an error to the user
        const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to download file.";
        // If the response was JSON (e.g., an error message from the server)
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

      if (isLoading) return <div className="container"><p>Loading submissions...</p></div>;
      if (error) return <div className="container error-message"><p>{error}</p></div>;

      return (
          <div className="container">
              <h2>Submissions for: {assignmentDef?.title || 'Assignment'}</h2>
              {assignmentDef && <p>Due: {new Date(assignmentDef.dueDate).toLocaleString()} | Points: {assignmentDef.pointsPossible}</p>}

              {submissions.length === 0 ? (
                  <p>No submissions yet for this assignment.</p>
              ) : (
                  <ul className="item-list">
                      {submissions.map((sub) => (
                          <li key={sub._id} className="list-item">
                              <h4>Student: {sub.student?.name || 'Unknown Student'} ({sub.student?.email})</h4>
                              <p>Submitted on: {new Date(sub.submissionDate).toLocaleString()} {sub.isLate && <span style={{color: 'orange'}}>(Late)</span>}</p>
                              {sub.submissionText && <div><strong>Text:</strong> <pre style={{whiteSpace: 'pre-wrap', background: '#f9f9f9', padding: '5px', border: '1px solid #eee'}}>{sub.submissionText}</pre></div>}
                              {sub.submittedFile && (
                                  <p>
                                      <strong>File:</strong>{' '}
                                       <button
                                        onClick={() => handleDownloadFile(sub._id, sub.submittedFile.originalName)}
                                        className="button-link" // Style as a link if desired
                                        >
                                        {sub.submittedFile.originalName}
                                        </button>
                                  </p>
                              )}
                              <p><strong>Current Grade:</strong> {sub.grade !== null && sub.grade !== undefined ? `${sub.grade} / ${assignmentDef?.pointsPossible || 100}` : 'Not Graded'}</p>
                              {sub.instructorFeedback && <p><strong>Feedback:</strong> {sub.instructorFeedback}</p>}
                              <button onClick={() => openGradingModal(sub)} className="button">
                                  {sub.grade !== null && sub.grade !== undefined ? 'Edit Grade/Feedback' : 'Grade/Feedback'}
                              </button>
                          </li>
                      ))}
                  </ul>
              )}

              {currentSubmissionToGrade && (
                  <Modal isOpen={isGradingModalOpen} onClose={() => setIsGradingModalOpen(false)} title={`Grade Submission for ${currentSubmissionToGrade.student?.name}`}>
                      <form onSubmit={handleGradeSubmit}>
                          {gradingError && <p className="error-message">{gradingError}</p>}
                          <div className="form-group">
                              <label htmlFor="grade">Grade (out of {assignmentDef?.pointsPossible || 100}):</label>
                              <input
                                  type="number"
                                  id="grade"
                                  value={grade}
                                  onChange={(e) => setGrade(e.target.value)}
                                  max={assignmentDef?.pointsPossible || 100}
                                  min="0"
                                  required
                              />
                          </div>
                          <div className="form-group">
                              <label htmlFor="feedback">Feedback:</label>
                              <textarea
                                  id="feedback"
                                  value={feedback}
                                  onChange={(e) => setFeedback(e.target.value)}
                                  rows="5"
                                  required
                              />
                          </div>
                          <button type="submit" className="primary">Submit Grade</button>
                      </form>
                  </Modal>
              )}
          </div>
      );
  };
  export default ViewSubmissionsPage;
  