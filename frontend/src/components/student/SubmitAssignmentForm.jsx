// src/components/student/SubmitAssignmentForm.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Adjust path

const SubmitAssignmentForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState(''); // Student needs to select a course
    const [courses, setCourses] = useState([]); // To populate course dropdown
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    // Fetch student's enrolled courses to populate the dropdown
    useEffect(() => {
        const fetchCourses = async () => {
            if (!token) return;
            try {
                // You'll need an endpoint to get courses the student is enrolled in
                const response = await fetch('/api/students/me/courses', { // Example endpoint
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch courses');
                const data = await response.json();
                setCourses(data || []); // Ensure data is an array
                if (data.length > 0) {
                    setSelectedCourseId(data[0]._id); // Default to first course
                }
            } catch (err) {
                console.error("Error fetching courses:", err);
                setError('Could not load your courses. Please try again later.');
            }
        };
        fetchCourses();
    }, [token]);


    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!file || !title || !selectedCourseId) {
            setError('Title, Course, and Assignment File are required.');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('courseId', selectedCourseId);
        formData.append('assignmentFile', file); // Matches multer fieldname

        try {
            const response = await fetch('/api/assignments/addassignment', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to submit assignment.');
            }

            setSuccess('Assignment submitted successfully! Redirecting...');
            setTitle('');
            setDescription('');
            setFile(null);
            setSelectedCourseId(courses.length > 0 ? courses[0]._id : '');
            // Clear file input visually
            if (document.getElementById('assignmentFile')) {
                 document.getElementById('assignmentFile').value = "";
            }
            setTimeout(() => navigate('/student/assignments'), 2000); // Redirect after a delay
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container">
            <h2>Submit New Assignment</h2>
            <form onSubmit={handleSubmit}>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <div className="form-group">
                    <label htmlFor="title">Assignment Title:</label>
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={isSubmitting} />
                </div>
                <div className="form-group">
                    <label htmlFor="course">Course:</label>
                    <select id="course" value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} required disabled={isSubmitting || courses.length === 0}>
                        <option value="" disabled>Select a course</option>
                        {courses.map(course => (
                            <option key={course._id} value={course._id}>{course.title || course.name}</option>
                        ))}
                    </select>
                    {courses.length === 0 && <small>Loading courses or no courses enrolled.</small>}
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description (Optional):</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isSubmitting}/>
                </div>
                <div className="form-group">
                    <label htmlFor="assignmentFile">Assignment File:</label>
                    <input type="file" id="assignmentFile" onChange={handleFileChange} required disabled={isSubmitting}/>
                </div>
                <button type="submit" className="primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                </button>
            </form>
        </div>
    );
};

export default SubmitAssignmentForm;