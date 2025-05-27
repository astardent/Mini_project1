// frontend/src/components/student/CourseListStudent.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Link } from 'react-router-dom'; // For linking to a submission page
import api from '../../utils/api'; // Use your configured Axios instance
import { AuthContext } from '../../context/AuthContext'; // To ensure user is authenticated

const CourseListStudent = () => {
  const [courses, setCourses] = useState([]);
  // This state should hold Assignment Definitions, not just simple "assignments"
  const [assignmentDefinitions, setAssignmentDefinitions] = useState([]);
  const [mySubmissions, setMySubmissions] = useState({}); // To track if student has submitted
  const [isLoading, setIsLoading] = useState(true); // Changed initial state to true
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext); // Get token for API calls (interceptor handles it)

  const fetchData = useCallback(async () => {
    if (!token) {
        setError("Not authenticated. Please log in.");
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    setError('');
    try {
      // Fetch all courses (or courses student is enrolled in if you implement that)
      const coursesResponse = await api.get('/courses');
      setCourses(coursesResponse.data || []);

      // Fetch all assignment definitions relevant to the student.
      // The backend GET /api/assignments controller (getAllAssignmentDefinitions)
      // should filter by student context if needed, or return all if students see all.
      // It's crucial that the 'course' field in each assignment definition is populated
      // with at least the course's _id.
      const assignmentsResponse = await api.get('/assignments');
      setAssignmentDefinitions(assignmentsResponse.data || []);

      // Fetch the student's own submissions to know what they've already submitted for
      const mySubsResponse = await api.get('/assignments/submissions/me'); // Your endpoint for student's submissions
      const submissionsMap = (mySubsResponse.data || []).reduce((acc, sub) => {
        // Ensure assignmentDefinition is populated or is an ID string
        const defId = sub.assignmentDefinition?._id || sub.assignmentDefinition;
        if (defId) {
            acc[defId.toString()] = sub;
        }
        return acc;
      }, {});
      setMySubmissions(submissionsMap);

    } catch (err) {
      setError('Failed to fetch data: ' + (err.response?.data?.error || err.message));
      console.error("Fetch data error in CourseListStudent:", err);
    }
    setIsLoading(false);
  }, [token]); // Depend on token to re-fetch if auth state changes

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) return <p>Loading courses and assignments...</p>;
  if (error) return <p className="error-message" style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="container"> {/* Added container for consistent styling */}
      <h2>Available Courses and Assignments</h2>
      {courses.length === 0 && !isLoading && <p>No courses available at the moment.</p>} {/* Show only if not loading */}
      
      {courses.map(course => {
        // Filter assignment definitions to find those belonging to the current course
        // This relies on assignmentDefinition.course being either an ObjectId string
        // or a populated object with an _id property.
        const courseSpecificAssignmentDefinitions = assignmentDefinitions.filter(definition => {
          if (!definition.course) return false; // Skip if course info is missing
          const courseIdInDefinition = definition.course._id || definition.course; // Handle populated or just ID
          return courseIdInDefinition.toString() === course._id.toString();
        });

        return (
          <div key={course._id} className="list-item course-item"> {/* Added course-item class */}
            <h3>{course.coursename} ({course.coursecode})</h3>
            {courseSpecificAssignmentDefinitions.length > 0 ? (
              <>
                <h4>Assignments for this course:</h4>
                <ul className="assignment-list-student"> {/* Added class */}
                  {courseSpecificAssignmentDefinitions.map(def => {
                    const hasSubmitted = !!mySubmissions[def._id.toString()];
                    return (
                      <li key={def._id} className="assignment-item-student"> {/* Added class */}
                        <strong>{def.title}</strong>
                        <p className="assignment-description">{def.description}</p> {/* Added class */}
                        <p className="assignment-due-date">Due: {new Date(def.dueDate).toLocaleString()}</p> {/* Added class */}
                        <p className="assignment-points">Points: {def.pointsPossible || 100}</p> {/* Added class */}
                        
                        {hasSubmitted ? (
                          <div className="submission-status submitted"> {/* Added classes */}
                            <p>✓ Submitted on {new Date(mySubmissions[def._id.toString()].submissionDate).toLocaleDateString()}</p>
                            {/* Optionally link to view their submission details */}
                            <Link to="/student/my-submissions" className="button small">View My Submissions</Link>
                          </div>
                        ) : (
                          // Link to a specific submission page for this assignment definition
                          // You need to create this route and the corresponding component
                          <Link to={`/student/assignments/${def._id}/submit`} className="button primary small">
                            Submit Assignment
                          </Link>
                        )}
                      </li>
                    );
                  })}
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