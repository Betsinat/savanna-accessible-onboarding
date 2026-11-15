
const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    trim: true
  },
  jobId: {
    type: String,
    required: true,
    trim: true
  },
  candidateName: {
    type: String,
    required: true,
    trim: true
  },
  voiceAnswers: [{
    questionId: {
      type: String,
      trim: true
    },
    audioTranscript: {
      type: String,
      trim: true,
      maxlength: 10000
    }
  }],
  requestedAccommodations: {
    type: [String],
    default: []
  },
    status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

JobApplicationSchema.index(
  { sessionId: 1, jobId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  'JobApplication',
  JobApplicationSchema
);
