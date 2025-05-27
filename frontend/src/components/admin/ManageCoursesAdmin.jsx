// frontend/src/components/admin/ManageCoursesAdmin.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import Modal from '../common/Modal';

const ManageCoursesAdmin = () => {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCourse, setCurrentCourse] = useState({
        coursename: '',
        coursecode: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingCourseId, setEditingCourseId] = useState(null);

    const fetchCourses = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.get('/admin/courses'); // Admin endpoint
            setCourses(response.data || []);
        } catch (err) {
            setError('Failed to fetch courses: ' + (err.response?.data?.error || err.message));
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentCourse(prev => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setIsEditing(false);
        setEditingCourseId(null);
        setCurrentCourse({ coursename: '', coursecode: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (course) => {
        setIsEditing(true);
        setEditingCourseId(course._id);
        setCurrentCourse({
            coursename: course.coursename,
            coursecode: course.coursecode,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setError('');
        setCurrentCourse({ coursename: '', coursecode: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!currentCourse.coursename || !currentCourse.coursecode) {
            setError("Course Name and Course Code are required.");
            return;
        }

        const payload = {
            coursename: currentCourse.coursename,
            coursecode: currentCourse.coursecode,
        };

        try {
            if (isEditing && editingCourseId) {
                await api.put(`/admin/courses/${editingCourseId}`, payload);
            } else {
                await api.post('/admin/courses', payload);
            }
            fetchCourses();
            closeModal();
        } catch (err) {
            setError('Failed to save course: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDelete = async (courseId, courseName) => {
        if (window.confirm(`Are you sure you want to delete course: ${courseName} (${courseId})? This may affect related assignments and submissions.`)) {
            try {
                await api.delete(`/admin/courses/${courseId}`);
                fetchCourses();
            } catch (err) {
                setError('Failed to delete course: ' + (err.response?.data?.error || err.message));
            }
        }
    };

    if (isLoading) return <div className="container"><p>Loading courses...</p></div>;

    return (
        <div className="container">
            <h2>Manage Courses</h2>
            <button onClick={openAddModal} className="primary button">
                Add New Course
            </button>
            {error && <p className="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

            <div className="list-container" style={{ marginTop: '20px' }}>
                {courses.length === 0 && !isLoading && <p>No courses found.</p>}
                {courses.map(course => (
                    <div key={course._id} className="list-item">
                        <div>
                            <h3>{course.coursename}</h3>
                            <p>Code: {course.coursecode}</p>
                            <p>ID: {course._id}</p>
                        </div>
                        <div className="actions">
                            <button onClick={() => openEditModal(course)} className="button">Edit</button>
                            <button onClick={() => handleDelete(course._id, course.coursename)} className="button danger">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? "Edit Course" : "Add New Course"}>
                <form onSubmit={handleSubmit}>
                    {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
                    <div className="form-group">
                        <label htmlFor="coursename">Course Name:</label>
                        <input type="text" id="coursename" name="coursename" value={currentCourse.coursename} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="coursecode">Course Code:</label>
                        <input type="text" id="coursecode" name="coursecode" value={currentCourse.coursecode} onChange={handleInputChange} required /* disabled={isEditing} // Consider if course code should be editable */ />
                        {/* {isEditing && <small>Course code changes might have wider implications.</small>} */}
                    </div>
                    <div className="modal-actions" style={{ marginTop: '20px', textAlign: 'right' }}>
                        <button type="button" onClick={closeModal} className="button secondary" style={{ marginRight: '10px' }}>Cancel</button>
                        <button type="submit" className="button primary">{isEditing ? "Update Course" : "Add Course"}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
export default ManageCoursesAdmin;