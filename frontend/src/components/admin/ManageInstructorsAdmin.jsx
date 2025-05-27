// frontend/src/components/admin/ManageInstructorsAdmin.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import Modal from '../common/Modal';

const ManageInstructorsAdmin = () => {
    const [instructors, setInstructors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentInstructor, setCurrentInstructor] = useState({
        name: '',
        email: '',
        password: '', // For creation or if admin explicitly sets new password
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingInstructorId, setEditingInstructorId] = useState(null);

    const fetchInstructors = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.get('/admin/instructors');
            setInstructors(response.data || []);
        } catch (err) {
            setError('Failed to fetch instructors: ' + (err.response?.data?.error || err.message));
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchInstructors();
    }, [fetchInstructors]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentInstructor(prev => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setIsEditing(false);
        setEditingInstructorId(null);
        setCurrentInstructor({ name: '', email: '', password: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (instructor) => {
        setIsEditing(true);
        setEditingInstructorId(instructor._id);
        setCurrentInstructor({
            name: instructor.name,
            email: instructor.email,
            password: '', // For setting a new password, leave blank if no change
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setError('');
        setCurrentInstructor({ name: '', email: '', password: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!currentInstructor.name || !currentInstructor.email) {
            setError("Name and Email are required.");
            return;
        }
        if (!isEditing && !currentInstructor.password) {
            setError("Password is required for new instructors.");
            return;
        }

        const payload = {
            name: currentInstructor.name,
            email: currentInstructor.email,
        };

        // Only include password if it's being set (for new or explicit change)
        if (!isEditing || (isEditing && currentInstructor.password.trim() !== "")) {
            payload.password = currentInstructor.password;
        }


        try {
            if (isEditing && editingInstructorId) {
                await api.put(`/admin/instructors/${editingInstructorId}`, payload);
            } else {
                await api.post('/admin/instructors', payload); // Admin creates instructor
            }
            fetchInstructors();
            closeModal();
        } catch (err) {
            setError('Failed to save instructor: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDelete = async (instructorId, instructorName) => {
        if (window.confirm(`Are you sure you want to delete instructor: ${instructorName} (${instructorId})? This may affect their courses and assignments.`)) {
            try {
                await api.delete(`/admin/instructors/${instructorId}`);
                fetchInstructors();
            } catch (err) {
                setError('Failed to delete instructor: ' + (err.response?.data?.error || err.message));
            }
        }
    };

    if (isLoading) return <div className="container"><p>Loading instructors...</p></div>;

    return (
        <div className="container">
            <h2>Manage Instructors</h2>
            <button onClick={openAddModal} className="primary button">
                Add New Instructor
            </button>
            {error && <p className="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

            <div className="list-container" style={{ marginTop: '20px' }}>
                {instructors.length === 0 && !isLoading && <p>No instructors found.</p>}
                {instructors.map(instructor => (
                    <div key={instructor._id} className="list-item">
                        <div>
                            <h3>{instructor.name}</h3>
                            <p>Email: {instructor.email}</p>
                            <p>ID: {instructor._id}</p>
                        </div>
                        <div className="actions">
                            <button onClick={() => openEditModal(instructor)} className="button">Edit</button>
                            <button onClick={() => handleDelete(instructor._id, instructor.name)} className="button danger">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? "Edit Instructor" : "Add New Instructor"}>
                <form onSubmit={handleSubmit}>
                    {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
                    <div className="form-group">
                        <label htmlFor="name">Full Name:</label>
                        <input type="text" id="name" name="name" value={currentInstructor.name} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" value={currentInstructor.email} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password {isEditing ? "(Leave blank to keep current)" : ""}:</label>
                        <input type="password" id="password" name="password" value={currentInstructor.password} onChange={handleInputChange} required={!isEditing} />
                    </div>
                    <div className="modal-actions" style={{ marginTop: '20px', textAlign: 'right' }}>
                        <button type="button" onClick={closeModal} className="button secondary" style={{ marginRight: '10px' }}>Cancel</button>
                        <button type="submit" className="button primary">{isEditing ? "Update Instructor" : "Add Instructor"}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
export default ManageInstructorsAdmin;