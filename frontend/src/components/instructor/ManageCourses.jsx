import React, { useState, useEffect, useCallback } from 'react';
import { getAllCourses, addCourse, updateCourse, deleteCourse } from '../../services/courseService';
import Modal from '../common/Modal';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState({ coursename: '', coursecode: '' });
  const [isEditing, setIsEditing] = useState(false);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getAllCourses();
      setCourses(data);
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
    setCurrentCourse({ coursename: '', coursecode: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setIsEditing(true);
    setCurrentCourse(course); // Assuming course object has _id, coursename, coursecode
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError(''); // Clear modal-specific errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isEditing) {
        // Backend updateCourse finds by coursecode and updates coursename
        await updateCourse({ coursename: currentCourse.coursename, coursecode: currentCourse.coursecode });
      } else {
        await addCourse(currentCourse);
      }
      fetchCourses();
      closeModal();
    } catch (err) {
       setError('Failed to save course: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (courseToDelete) => {
    if (window.confirm(`Are you sure you want to delete ${courseToDelete.coursename}?`)) {
      try {
        // Backend expects {coursename, coursecode} in body for delete
        await deleteCourse({ coursename: courseToDelete.coursename, coursecode: courseToDelete.coursecode });
        fetchCourses();
      } catch (err) {
        setError('Failed to delete course: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  if (isLoading) return <p>Loading courses...</p>;

  return (
    <div>
      <h2>Manage Courses</h2>
      <button onClick={openAddModal} className="primary">Add New Course</button>
      {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}
      
      <div className="list-container">
        {courses.length === 0 && !isLoading && <p>No courses found.</p>}
        {courses.map(course => (
          <div key={course._id || course.coursecode} className="list-item">
            <div>
              <h3>{course.coursename}</h3>
              <p>Code: {course.coursecode}</p>
            </div>
            <div className="actions">
              <button onClick={() => openEditModal(course)}>Edit</button>
              <button onClick={() => handleDelete(course)} className="danger">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? "Edit Course" : "Add Course"}>
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}
          <div className="form-group">
            <label htmlFor="coursename">Course Name:</label>
            <input
              type="text"
              id="coursename"
              name="coursename"
              value={currentCourse.coursename}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="coursecode">Course Code:</label>
            <input
              type="text"
              id="coursecode"
              name="coursecode"
              value={currentCourse.coursecode}
              onChange={handleInputChange}
              required
              disabled={isEditing} // Course code might be identifier, so not editable
            />
             {isEditing && <small>Course code cannot be changed after creation.</small>}
          </div>
          <button type="submit" className="primary">{isEditing ? "Update" : "Add"} Course</button>
          <button type="button" onClick={closeModal}>Cancel</button>
        </form>
      </Modal>
    </div>
  );
};

export default ManageCourses;