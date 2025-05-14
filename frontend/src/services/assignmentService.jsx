import api from '../utils/api';

export const getAllAssignments = async () => {
    const response = await api.get('/assignments');
    return response.data;
};

export const addAssignment = async (assignmentData) => {
    const response = await api.post('/assignments/addassignment', assignmentData);
    return response.data;
};

export const updateAssignment = async (assignmentData) => {
    // Backend expects { name (new name), coursecode (identifier) }
    const response = await api.put('/assignments/updateassignment', assignmentData);
    return response.data;
};

export const deleteAssignment = async (assignmentData) => { // Backend expects name and coursecode
    const response = await api.delete('/assignments/deleteassignment', { data: assignmentData });
    return response.data;
};