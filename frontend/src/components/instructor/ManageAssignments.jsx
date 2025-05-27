// frontend/src/components/instructor/ManageAssignments.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api'; // Your configured Axios instance
import Modal from '../common/Modal'; // Your Modal component
// We are not using assignmentService directly here anymore for definitions, but using 'api'

const ManageAssignments = () => {
    const [assignmentDefinitions, setAssignmentDefinitions] = useState([]);
    const [courses, setCourses] = useState([]); // For the course selection dropdown
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    // State for the assignment definition being created or edited
    const [currentDefinition, setCurrentDefinition] = useState({
        title: '',
        description: '',
        dueDate: '',
        pointsPossible: 100,
        courseId: '', // This will store the _id of the selected course
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingDefinitionId, setEditingDefinitionId] = useState(null); // To store _id of definition being edited

    const fetchDefinitionsAndCourses = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            // Fetch assignment definitions created by this instructor
            // The backend GET /api/assignments controller (getAllAssignmentDefinitions)
            // will filter by instructor ID based on req.user.
            const defsResponse = await api.get('/assignments');
            setAssignmentDefinitions(defsResponse.data || []);

            // Fetch all courses to populate the dropdown for creating/editing assignments
            const coursesResponse = await api.get('/courses');
            //console.log(coursesResponse.data);
            setCourses(coursesResponse.data || []);

            // Set a default course for new assignments if courses are available
            if (coursesResponse.data && coursesResponse.data.length > 0 && !currentDefinition.courseId) {
                // Only set if not already editing or if courseId is empty
                if (!isEditing) { // Or check if currentDefinition.courseId is empty
                     setCurrentDefinition(prev => ({ ...prev, courseId: coursesResponse.data[0]._id }));
                }
            }
        } catch (err) {
            setError('Failed to fetch data: ' + (err.response?.data?.error || err.message));
        }
        setIsLoading(false);
    }, [isEditing]); // Added isEditing to dependencies to control default courseId setting

    useEffect(() => {
        fetchDefinitionsAndCourses();
    }, [fetchDefinitionsAndCourses]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentDefinition(prev => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setIsEditing(false);
        setEditingDefinitionId(null);
        setCurrentDefinition({
            title: '',
            description: '',
            dueDate: '',
            pointsPossible: 100,
            courseId: courses.length > 0 ? courses[0]._id : '', // Default to first course
        });
        setIsModalOpen(true);
    };

    const openEditModal = (definition) => {
        setIsEditing(true);
        setEditingDefinitionId(definition._id);
        setCurrentDefinition({
            title: definition.title,
            description: definition.description,
            // Format dueDate for datetime-local input
            dueDate: definition.dueDate ? new Date(definition.dueDate).toISOString().substring(0, 16) : '',
            pointsPossible: definition.pointsPossible || 100,
            courseId: definition.course?._id || definition.course, // Handle populated or just ID
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setError(''); // Clear modal specific errors
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!currentDefinition.courseId || !currentDefinition.title || !currentDefinition.description || !currentDefinition.dueDate) {
            setError("Course, Title, Description, and Due Date are required.");
            return;
        }

        // Ensure pointsPossible is a number
        const points = parseInt(currentDefinition.pointsPossible, 10);
        if (isNaN(points)) {
            setError("Points Possible must be a valid number.");
            return;
        }

        const payload = {
            title: currentDefinition.title,
            description: currentDefinition.description,
            dueDate: currentDefinition.dueDate,
            pointsPossible: points,
            courseId: currentDefinition.courseId, // This key 'courseId' is expected by your backend controller
        };

        try {
            if (isEditing && editingDefinitionId) {
                await api.put(`/assignments/${editingDefinitionId}`, payload);
            } else {
                await api.post('/assignments', payload); // POST to create new AssignmentDefinition
            }
            fetchDefinitionsAndCourses(); // Refresh the list
            closeModal();
        } catch (err) {
            setError('Failed to save assignment definition: ' + (err.response?.data?.error || err.message));
            // Keep modal open if there's an error during save
        }
    };

    const handleDelete = async (definitionId) => {
        if (window.confirm(`Are you sure you want to delete this assignment definition? This may affect student submissions.`)) {
            try {
                await api.delete(`/assignments/${definitionId}`);
                fetchDefinitionsAndCourses(); // Refresh the list
            } catch (err) {
                setError('Failed to delete assignment definition: ' + (err.response?.data?.error || err.message));
            }
        }
    };

    if (isLoading) return <p>Loading assignment definitions...</p>;

    return (
        <div className="container">
            <h2>Manage Assignment Definitions</h2>
            <button onClick={openAddModal} className="primary button" disabled={courses.length === 0}>
                Create New Assignment Definition
            </button>
            {courses.length === 0 && !isLoading && <p style={{ color: 'orange', marginTop: '10px' }}>Please add courses first to create assignments.</p>}
            {error && <p className="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

            <div className="list-container" style={{ marginTop: '20px' }}>
                {assignmentDefinitions.length === 0 && !isLoading && <p>No assignment definitions found. Create one to get started!</p>}
                {assignmentDefinitions.map(def => (
                    <div key={def._id} className="list-item">
                        <div>
                            <h3>{def.title}</h3>
                            <p><strong>Course:</strong> {def.course?.coursename || 'N/A'} ({def.course?.coursecode || 'N/A'})</p>
                            <p><strong>Due:</strong> {new Date(def.dueDate).toLocaleString()}</p>
                            <p><strong>Points:</strong> {def.pointsPossible}</p>
                        </div>
                        <div className="actions">
                            <Link to={`/instructor/assignments/${def._id}/submissions`} className="button">
                                View Submissions
                            </Link>
                            <button onClick={() => openEditModal(def)} className="button">Edit</button>
                            <button onClick={() => handleDelete(def._id)} className="button danger">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? "Edit Assignment Definition" : "Create New Assignment Definition"}>
                <form onSubmit={handleSubmit}>
                    {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
                    <div className="form-group">
                        <label htmlFor="title">Title:</label>
                        <input type="text" id="title" name="title" value={currentDefinition.title} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="courseId">Course:</label>
                        <select id="courseId" name="courseId" value={currentDefinition.courseId} onChange={handleInputChange} required>
                            <option value="">Select a Course</option>
                            {courses.map(course => (
                                <option key={course._id} value={course._id}> {/* Use course._id as value */}
                                    {course.coursename} ({course.coursecode})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description:</label>
                        <textarea id="description" name="description" rows="4" value={currentDefinition.description} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="dueDate">Due Date & Time:</label>
                        <input type="datetime-local" id="dueDate" name="dueDate" value={currentDefinition.dueDate} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="pointsPossible">Points Possible:</label>
                        <input type="number" id="pointsPossible" name="pointsPossible" min="0" value={currentDefinition.pointsPossible} onChange={handleInputChange} />
                    </div>
                    <div className="modal-actions" style={{ marginTop: '20px', textAlign: 'right' }}>
                        <button type="button" onClick={closeModal} className="button secondary" style={{ marginRight: '10px' }}>Cancel</button>
                        <button type="submit" className="button primary">{isEditing ? "Update Definition" : "Create Definition"}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ManageAssignments;