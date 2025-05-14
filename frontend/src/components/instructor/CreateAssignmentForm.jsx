// components/instructor/CreateAssignmentForm.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api'; // Your configured Axios instance

const CreateAssignmentForm = ({ courseId, onAssignmentCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [pointsPossible, setPointsPossible] = useState(100);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!title || !description || !dueDate) {
            setError('All fields are required.');
            return;
        }
        setIsLoading(true);
        try {
            // The backend route might be /api/instructor/assignments and expect courseId in body,
            // or /api/courses/:courseId/assignments
            const response = await api.post(`/courses/${courseId}/assignments`, {
                title,
                description,
                dueDate,
                pointsPossible,
            }/*, { headers: { Authorization: `Bearer ${token}` } } // Axios interceptor handles this */);
            onAssignmentCreated(response.data); // Callback to update parent list
            setTitle(''); setDescription(''); setDueDate(''); setPointsPossible(100);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to create assignment.');
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h4>Create New Assignment</h4>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div><label>Title: <input type="text" value={title} onChange={e => setTitle(e.target.value)} required /></label></div>
            <div><label>Description: <textarea value={description} onChange={e => setDescription(e.target.value)} required /></label></div>
            <div><label>Due Date: <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} required /></label></div>
            <div><label>Points: <input type="number" value={pointsPossible} onChange={e => setPointsPossible(e.target.value)} /></label></div>
            <button type="submit" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Assignment'}</button>
        </form>
    );
};
export default CreateAssignmentForm;