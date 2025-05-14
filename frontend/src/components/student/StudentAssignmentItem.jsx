// components/student/StudentAssignmentItem.js (part of a list)
import React, { useState } from 'react';
import StudentSubmissionForm from './StudentSubmissionForm'; // You'll create this

const StudentAssignmentItem = ({ assignmentDefinition, courseId, mySubmission }) => {
    const [showSubmitForm, setShowSubmitForm] = useState(false);

    return (
        <div className="list-item">
            <h3>{assignmentDefinition.title}</h3>
            <p>Due: {new Date(assignmentDefinition.dueDate).toLocaleString()}</p>
            <p>{assignmentDefinition.description}</p>
            {mySubmission ? (
                <div>
                    <p><strong>You submitted on:</strong> {new Date(mySubmission.submissionDate).toLocaleString()}</p>
                    {mySubmission.submittedFile && (
                        <a href={`/api/submissions/${mySubmission._id}/download`} target="_blank" rel="noopener noreferrer">
                            Download Your Submission
                        </a>
                    )}
                    {/* Add logic for re-submission if allowed */}
                </div>
            ) : (
                <button onClick={() => setShowSubmitForm(true)}>Submit Assignment</button>
            )}
            {showSubmitForm && !mySubmission && (
                <StudentSubmissionForm
                    assignmentDefId={assignmentDefinition._id}
                    courseId={courseId}
                    onSubmissionSuccess={() => {
                        setShowSubmitForm(false);
                        // TODO: Refresh assignment/submission list
                    }}
                />
            )}
        </div>
    );
};
export default StudentAssignmentItem;
