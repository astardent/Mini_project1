import api from '../utils/api'; // Assuming api.js is set up for base URL

export const getAllCourses = async () => {
    const response = await api.get('/courses');
    return response.data;
};

export const addCourse = async (courseData) => {
    const response = await api.post('/courses/addcourse', courseData);
    return response.data;
};

export const updateCourse = async (courseData) => {
    // Backend updates by coursecode and expects coursename to update
    // This might need to be { coursecode: 'XYZ', newCoursename: 'ABC' }
    // Or if the backend expects the full object and finds by coursecode:
    const response = await api.put('/courses/updatecourse', courseData);
    return response.data;
};

export const deleteCourse = async (courseData) => { // Backend expects coursename and coursecode in body
    const response = await api.delete('/courses/deletecourse', { data: courseData });
    return response.data;
};