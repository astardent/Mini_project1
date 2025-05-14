// components/student/StudentSubmissionForm.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api'; // Your configured Axios instance

const StudentSubmissionForm = ({ assignmentDefId, courseId, onSubmissionSuccess }) => {
    const [submissionText, setSubmissionText] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useContext(AuthContext);

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!submissionText && !file) {
            setError('Please provide text or a file for submission.');
            return;
        }
        setError('');
        setIsLoading(true);

        const formData = new FormData();
        formData.append('submissionText', submissionText);
        if (file) {
            formData.append('submissionFile', file); // Matches multer fieldname
        }
        // courseId is not strictly needed in formData if derivable from assignmentDefId on backend
        // but can be useful for context or if your submit route isn't nested under assignmentDefId

        try {
            const response = await api.post(`/assignments/${assignmentDefId}/submit`, formData, {
                // headers: { 'Content-Type': 'multipart/form-data' } // Axios sets this with FormData
                // Authorization header is added by interceptor
            });
            onSubmissionSuccess(response.data);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to submit.');
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
            <h4>Submit Your Work</h4>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <label>Text Submission (Optional):</label>
                <textarea value={submissionText} onChange={(e) => setSubmissionText(e.target.value)} />
            </div>
            <div>
                <label>File Upload (Optional):</label>
                <input type="file" onChange={handleFileChange} />
            </div>
            <button type="submit" disabled={isLoading}>{isLoading ? 'Submitting...' : 'Submit'}</button>
        </form>
    );
};
export default StudentSubmissionForm;