import React, { useState, useEffect, useCallback } from 'react';
import { getAllAssignments, addAssignment, updateAssignment, deleteAssignment } from '../../services/assignmentService';
import { getAllCourses } from '../../services/courseService'; // To select a course for the assignment
import Modal from '../common/Modal';

const ManageAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]); // For dropdown
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState({ name: '', coursecode: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [originalCourseCode, setOriginalCourseCode] = useState(''); // For updates

  const fetchAssignmentsAndCourses = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [assignmentsData, coursesData] = await Promise.all([
        getAllAssignments(),
        getAllCourses()
      ]);
      setAssignments(assignmentsData);
      setCourses(coursesData);
      if (coursesData.length > 0 && !currentAssignment.coursecode) {
        setCurrentAssignment(prev => ({ ...prev, coursecode: coursesData[0].coursecode }));
      }
    } catch (err) {
      setError('Failed to fetch data: ' + (err.response?.data?.error || err.message));
    }
    setIsLoading(false);
  }, [currentAssignment.coursecode]);

  useEffect(() => {
    fetchAssignmentsAndCourses();
  }, [fetchAssignmentsAndCourses]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentAssignment(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentAssignment({ name: '', coursecode: courses.length > 0 ? courses[0].coursecode : '' });
    setIsModalOpen(true);
  };

  const openEditModal = (assignment) => {
    setIsEditing(true);
    setCurrentAssignment({ name: assignment.name, coursecode: assignment.coursecode });
    setOriginalCourseCode(assignment.coursecode); // Store original for update if coursecode itself is the key
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!currentAssignment.coursecode) {
        setError("Please select a course.");
        return;
    }
    try {
      if (isEditing) {
        // Backend updateAssignment expects { name (new name), coursecode (identifier) }
        // If coursecode itself can be changed, the backend logic needs to handle finding by _id.
        // Assuming coursecode is the key for finding and we're only changing the assignment name.
        await updateAssignment({ name: currentAssignment.name, coursecode: currentAssignment.coursecode });
      } else {
        await addAssignment(currentAssignment);
      }
      fetchAssignmentsAndCourses();
      closeModal();
    } catch (err) {
       setError('Failed to save assignment: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (assignmentToDelete) => {
    if (window.confirm(`Are you sure you want to delete assignment: ${assignmentToDelete.name}?`)) {
      try {
        // Backend expects {name, coursecode}
        await deleteAssignment({ name: assignmentToDelete.name, coursecode: assignmentToDelete.coursecode });
        fetchAssignmentsAndCourses();
      } catch (err) {
        setError('Failed to delete assignment: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  if (isLoading) return <p>Loading assignments and courses...</p>;

  return (
    <div>
      <h2>Manage Assignments</h2>
      <button onClick={openAddModal} className="primary" disabled={courses.length === 0}>Add New Assignment</button>
      {courses.length === 0 && <p style={{color: 'orange'}}>Please add courses first to create assignments.</p>}
      {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}
      
      <div className="list-container">
        {assignments.length === 0 && !isLoading && <p>No assignments found.</p>}
        {assignments.map(assignment => (
          <div key={assignment._id || `${assignment.name}-${assignment.coursecode}`} className="list-item">
            <div>
              <h3>{assignment.name}</h3>
              <p>Course Code: {assignment.coursecode}</p>
            </div>
            <div className="actions">
              <button onClick={() => openEditModal(assignment)}>Edit</button>
              <button onClick={() => handleDelete(assignment)} className="danger">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? "Edit Assignment" : "Add Assignment"}>
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}
          <div className="form-group">
            <label htmlFor="name">Assignment Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={currentAssignment.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="coursecode">Course:</label>
            <select
              id="coursecode"
              name="coursecode"
              value={currentAssignment.coursecode}
              onChange={handleInputChange}
              required
              // disabled={isEditing} // Allow changing course for assignment? Backend update relies on coursecode.
                                    // If coursecode is an identifier, it shouldn't be changed here.
                                    // If it CAN be changed, backend updateAssignment needs to find by _id.
                                    // For simplicity, let's say it's an identifier and can't be changed during edit.
            >
              <option value="">Select a Course</option>
              {courses.map(course => (
                <option key={course._id || course.coursecode} value={course.coursecode}>
                  {course.coursename} ({course.coursecode})
                </option>
              ))}
            </select>
             {isEditing && <small>To change the course, delete and re-create the assignment.</small>}
          </div>
          <button type="submit" className="primary">{isEditing ? "Update" : "Add"} Assignment</button>
          <button type="button" onClick={closeModal}>Cancel</button>
        </form>
      </Modal>
    </div>
  );
};

export default ManageAssignments;