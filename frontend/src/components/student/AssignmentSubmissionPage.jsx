// frontend/src/pages/student/AssignmentSubmissionPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentSubmissionForm from '../../components/student/StudentSubmissionForm'; // The focused form
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';

const AssignmentSubmissionPage = () => {
    const { assignmentDefId } = useParams();
    const navigate = useNavigate();
    const [assignmentDef, setAssignmentDef] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useContext(AuthContext);

    useEffect(() => {
        const fetchAssignmentDetails = async () => {
            if (!token || !assignmentDefId) {
                setError("Authentication or Assignment ID missing.");
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                // Fetch the details of the AssignmentDefinition the student is submitting to
                const response = await api.get(`/assignments/${assignmentDefId}`);
                setAssignmentDef(response.data);
            } catch (err) {
                setError(err.response?.data?.error || "Failed to load assignment details.");
            }
            setIsLoading(false);
        };
        fetchAssignmentDetails();
    }, [assignmentDefId, token]);

    const handleSubmissionSuccess = (submissionData) => {
        alert("Assignment submitted successfully!");
        navigate('/student/my-submissions'); // Or back to assignments list
    };

    if (isLoading) return <div className="container"><p>Loading assignment details...</p></div>;
    if (error) return <div className="container error-message"><p>{error}</p></div>;
    if (!assignmentDef) return <div className="container"><p>Assignment not found.</p></div>;

    return (
        <div className="container">
            <h2>Submit to: {assignmentDef.title}</h2>
            <p><strong>Course:</strong> {assignmentDef.course?.coursename || assignmentDef.course?.title || 'N/A'}</p>
            <p><strong>Due Date:</strong> {new Date(assignmentDef.dueDate).toLocaleString()}</p>
            <p><strong>Description:</strong> {assignmentDef.description}</p>
            <p><strong>Points:</strong> {assignmentDef.pointsPossible || 100}</p>
            <hr style={{ margin: '20px 0' }}/>
            <StudentSubmissionForm
                assignmentDefId={assignmentDefId} // Pass the ID
                // courseId={assignmentDef.course?._id || assignmentDef.course} // Pass if needed by form (backend can derive it)
                onSubmissionSuccess={handleSubmissionSuccess}
            />
        </div>
    );
};
export default AssignmentSubmissionPage;