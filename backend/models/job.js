
const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  requirements: {
    type: [String],
    default: []
  },
  offeredAccommodations: {
    type: [String],
    default: []
  },
  location: {
    type: String,
    trim: true,
    default: 'Not specified'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'closed'],
    default: 'active'
  }
}, {
  timestamps: true
});

JobSchema.index({ status: 1 });

module.exports = mongoose.model('Job', JobSchema);
