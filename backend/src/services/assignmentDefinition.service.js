const AssignmentDefinition = require('../models/assignmentDefinition.model');

exports.create = async (data) => {
    const assignment = new AssignmentDefinition(data);
    return await assignment.save();
};