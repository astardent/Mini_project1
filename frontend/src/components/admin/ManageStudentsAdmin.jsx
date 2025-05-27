// frontend/src/components/admin/ManageStudentsAdmin.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api'; // Your configured Axios instance
import Modal from '../common/Modal'; // Your Modal component

const ManageStudentsAdmin = () => {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState({
        name: '',
        email: '',
        password: '', // Only for creation, not typically for edit by admin
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingStudentId, setEditingStudentId] = useState(null);

    const fetchStudents = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            // API endpoint for admin to get all students
            const response = await api.get('/admin/students');
            setStudents(response.data || []);
        } catch (err) {
            setError('Failed to fetch students: ' + (err.response?.data?.error || err.message));
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentStudent(prev => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setIsEditing(false);
        setEditingStudentId(null);
        setCurrentStudent({ name: '', email: '', password: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (student) => {
        setIsEditing(true);
        setEditingStudentId(student._id);
        setCurrentStudent({
            name: student.name,
            email: student.email,
            password: '', // Password field is generally not pre-filled for edit by admin
                         // Or make it a separate "Change Password" action
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setError(''); // Clear modal specific errors
        setCurrentStudent({ name: '', email: '', password: '' }); // Reset form
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!currentStudent.email) {
            setError("Email is required.");
            return;
        }
        if (!isEditing && !currentStudent.password) {
            setError("Password is required for new students.");
            return;
        }


        const payload = {
            name: currentStudent.name,
            email: currentStudent.email,
        };

        // Only include password for new student creation
        if (!isEditing) {
            payload.password = currentStudent.password;
        }
        // For editing, password changes should ideally be a separate, more secure process
        // or the admin should only be able to trigger a password reset.
        // If you allow admin to set password on edit, add a separate field and logic.

        try {
            if (isEditing && editingStudentId) {
                // Admin updates student details (excluding password by default here)
                await api.put(`/admin/students/${editingStudentId}`, payload);
            } else {
                // Admin adds a new student (password will be hashed by backend service)
                await api.post('/admin/students', payload); // Assuming a route for admin to add students
            }
            fetchStudents(); // Refresh the list
            closeModal();
        } catch (err) {
            setError('Failed to save student: ' + (err.response?.data?.error || err.message));
            // Keep modal open if there's an error during save
        }
    };

    const handleDelete = async (studentId, studentName) => {
        if (window.confirm(`Are you sure you want to delete student: ${studentName} (${studentId})? This action cannot be undone.`)) {
            try {
                await api.delete(`/admin/students/${studentId}`);
                fetchStudents(); // Refresh the list
            } catch (err) {
                setError('Failed to delete student: ' + (err.response?.data?.error || err.message));
            }
        }
    };

    if (isLoading) return <div className="container"><p>Loading students...</p></div>;

    return (
        <div className="container">
            <h2>Manage Students</h2>
            <button onClick={openAddModal} className="primary button">
                Add New Student
            </button>
            {error && <p className="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

            <div className="list-container" style={{ marginTop: '20px' }}>
                {students.length === 0 && !isLoading && <p>No students found.</p>}
                {students.map(student => (
                    <div key={student._id} className="list-item">
                        <div>
                            <h3>{student.name}</h3>
                            <p>Email: {student.email}</p>
                            <p>ID: {student._id}</p>
                        </div>
                        <div className="actions">
                            <button onClick={() => openEditModal(student)} className="button">Edit</button>
                            <button onClick={() => handleDelete(student._id, student.name)} className="button danger">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? "Edit Student" : "Add New Student"}>
                <form onSubmit={handleSubmit}>
                    {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
                    <div className="form-group">
                        <label htmlFor="name">Full Name:</label>
                        <input type="text" id="name" name="name" value={currentStudent.name} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" value={currentStudent.email} onChange={handleInputChange} required />
                    </div>
                    {!isEditing && ( // Only show password field for new student creation
                        <div className="form-group">
                            <label htmlFor="password">Password:</label>
                            <input type="password" id="password" name="password" value={currentStudent.password} onChange={handleInputChange} required />
                        </div>
                    )}
                    {isEditing && (
                        <p><small>To change a student's password, please use the "Reset Password" feature (if available) or contact support. Direct password edits by admin are generally discouraged for security.</small></p>
                    )}
                    <div className="modal-actions" style={{ marginTop: '20px', textAlign: 'right' }}>
                        <button type="button" onClick={closeModal} className="button secondary" style={{ marginRight: '10px' }}>Cancel</button>
                        <button type="submit" className="button primary">{isEditing ? "Update Student" : "Add Student"}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ManageStudentsAdmin;