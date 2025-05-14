import React, { useState, useEffect, useCallback } from 'react';
import { getAllCourses } from '../../services/courseService';
import { getAllAssignments } from '../../services/assignmentService'; // To show assignments per course

const CourseListStudent = () => {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [coursesData, assignmentsData] = await Promise.all([
        getAllCourses(),
        getAllAssignments()
      ]);
      setCourses(coursesData);
      setAssignments(assignmentsData);
    } catch (err) {
      setError('Failed to fetch data: ' + (err.response?.data?.error || err.message));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) return <p>Loading courses and assignments...</p>;
  if (error) return <p className="error-message" style={{color: 'red'}}>{error}</p>;

  return (
    <div>
      <h2>Available Courses and Assignments</h2>
      {courses.length === 0 && <p>No courses available at the moment.</p>}
      {courses.map(course => {
        const courseAssignments = assignments.filter(
          assign => assign.coursecode === course.coursecode
        );
        return (
          <div key={course._id || course.coursecode} className="list-item" style={{flexDirection: 'column', alignItems: 'flex-start', marginBottom: '20px'}}>
            <h3>{course.coursename} ({course.coursecode})</h3>
            {courseAssignments.length > 0 ? (
              <>
                <h4>Assignments:</h4>
                <ul>
                  {courseAssignments.map(assign => (
                    <li key={assign._id || assign.name}>
                      {assign.name} 
                      {/* Placeholder for submission */}
                      <button style={{marginLeft: '10px', fontSize: '0.8em'}} onClick={() => alert(`Submit for ${assign.name} - Feature not implemented`)}>
                        Submit
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>No assignments for this course yet.</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CourseListStudent;