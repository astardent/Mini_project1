// frontend/src/components/student/StudentSubmissionForm.jsx
import React, { useState } from 'react'; // Removed useContext if token is handled by api interceptor
import api from '../../utils/api';

const StudentSubmissionForm = ({ assignmentDefId, onSubmissionSuccess }) => {
    const [submissionText, setSubmissionText] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) { // Check if a file is selected
        setFile(e.target.files[0]);
        console.log("File selected:", e.target.files[0].name, e.target.files[0].type); // DEBUG
    } else {
        setFile(null); // No file selected or selection cleared
        console.log("No file selected or selection cleared."); // DEBUG
    }
};
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!submissionText && !file) {
            setError('Please provide text or a file for submission.');
            return;
        }
        setError('');
        setIsLoading(true);
        console.log("File state before appending to FormData:", file);
        const formData = new FormData();
        formData.append('submissionText', submissionText);
        if (file) {
            formData.append('submissionFile', file); // Matches multer fieldname
            console.log("Appended file to FormData:", file.name); // DEBUG
        } else {
        console.log("No file was in state to append to FormData."); // DEBUG
    }

        try {
            // This API call now correctly targets the route for submitting to a specific definition
            const response = await api.post(`/assignments/${assignmentDefId}/submit`, formData);
            onSubmissionSuccess(response.data);
            // Optionally clear the form fields here
            setSubmissionText('');
            setFile(null);
            // Clear file input:
            const fileInput = e.target.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = "";

        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to submit.');
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '10px' }}>
            <h4>Your Submission</h4>
            {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}
            <div className="form-group">
                <label>Text (Optional):</label>
                <textarea value={submissionText} onChange={(e) => setSubmissionText(e.target.value)} disabled={isLoading} rows="5"/>
            </div>
            <div className="form-group">
                <label>File (Optional):</label>
                <input type="file" onChange={handleFileChange} disabled={isLoading}/>
            </div>
            <button type="submit" disabled={isLoading} className="primary">
                {isLoading ? 'Submitting...' : 'Submit Work'}
            </button>
        </form>
    );
};
export default StudentSubmissionForm;