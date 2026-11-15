
const express = require('express');
const mongoose = require('mongoose');

const Job = require('../models/job');
const JobApplication = require('../models/jobApplication');
const OnboardingProfile = require('../models/onboardingProfile');

const router = express.Router();

// GET /api/jobs
// Retrieve active jobs and filter by candidate accommodations
router.get('/jobs', async (req, res) => {
  try {
    const { sessionId, match = 'any' } = req.query;

    const filter = { status: 'active' };

    if (match !== 'any' && match !== 'all') {
      return res.status(400).json({
        success: false,
        message: 'match must be either any or all'
      });
    }

    if (sessionId) {
      const candidate = await OnboardingProfile.findOne({
        sessionId
      }).select('accommodationPreferences');

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: 'Candidate profile not found'
        });
      }

      const preferences = candidate.accommodationPreferences || [];

      if (preferences.length > 0) {
        filter.offeredAccommodations =
          match === 'all'
            ? { $all: preferences }
            : { $in: preferences };
      }
    }

    const jobs = await Job.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    });

  } catch (error) {
    console.error('Job listing error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve jobs'
    });
  }
});

// POST /api/jobs/apply
// Submit a candidate's job application
router.post('/jobs/apply', async (req, res) => {
  try {
    const {
      sessionId,
      jobId,
      candidateName,
      voiceAnswers,
      requestedAccommodations
    } = req.body;

    if (
      typeof sessionId !== 'string' ||
      !sessionId.trim() ||
      typeof jobId !== 'string' ||
      !jobId.trim() ||
      typeof candidateName !== 'string' ||
      !candidateName.trim() ||
      !Array.isArray(voiceAnswers) ||
      !Array.isArray(requestedAccommodations)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Required application information is missing or invalid'
      });
    }

    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID'
      });
    }

    if (
      !voiceAnswers.every(answer =>
        answer &&
        typeof answer.questionId === 'string' &&
        answer.questionId.trim() &&
        typeof answer.audioTranscript === 'string' &&
        answer.audioTranscript.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Each voice answer must have a questionId and audioTranscript'
      });
    }

    if (
      !requestedAccommodations.every(
        item => typeof item === 'string' && item.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Requested accommodations must contain valid strings'
      });
    }

    const job = await Job.findOne({
      _id: jobId,
      status: 'active'
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Active job not found'
      });
    }

    const existingApplication = await JobApplication.findOne({
      sessionId: sessionId.trim(),
      jobId
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    const application = new JobApplication({
      sessionId: sessionId.trim(),
      jobId,
      candidateName: candidateName.trim(),
      voiceAnswers,
      requestedAccommodations
    });

    await application.save();

    return res.status(201).json({
      success: true,
      message: 'Job application submitted successfully',
      applicationId: application._id
    });

  } catch (error) {
    console.error('Job application error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid application information'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to submit application'
    });
  }
});

// POST /api/employer/jobs
// Publish a job through the open hackathon demo
router.post('/employer/jobs', async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      requirements,
      offeredAccommodations,
      location
    } = req.body;

    if (
      typeof title !== 'string' ||
      !title.trim() ||
      typeof company !== 'string' ||
      !company.trim() ||
      typeof description !== 'string' ||
      !description.trim() ||
      (requirements !== undefined &&
        (!Array.isArray(requirements) ||
          !requirements.every(item =>
            typeof item === 'string' && item.trim()
          ))) ||
      (offeredAccommodations !== undefined &&
        (!Array.isArray(offeredAccommodations) ||
          !offeredAccommodations.every(item =>
            typeof item === 'string' && item.trim()
          ))) ||
      (location !== undefined && typeof location !== 'string')
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing job information'
      });
    }

    const job = new Job({
      title: title.trim(),
      company: company.trim(),
      description: description.trim(),
      requirements: (requirements || []).map(item => item.trim()),
      offeredAccommodations: (offeredAccommodations || []).map(item => item.trim()),
      location: location?.trim() || 'Not specified',
      status: 'active'
    });

    await job.save();

    return res.status(201).json({
      success: true,
      message: 'Job published successfully',
      job
    });

  } catch (error) {
    console.error('Employer job publishing error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid job information',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to publish job'
    });
  }
});
// GET /api/employer/jobs/:jobId/applications
// Retrieve applicants for a job (hackathon demo only)
router.get('/employer/jobs/:jobId/applications', async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID'
      });
    }

    const job = await Job.findById(jobId).select('title company');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const applications = await JobApplication.find({ jobId })
      .select('-sessionId -__v')
      .sort({ submittedAt: -1 });

    return res.status(200).json({
      success: true,
      job,
      count: applications.length,
      applications
    });

  } catch (error) {
    console.error('Employer applicant retrieval error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve applicants'
    });
  }
});
// PATCH /api/employer/applications/:applicationId/status
// Update an applicant's status (hackathon demo only)
router.patch('/employer/applications/:applicationId/status', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      'pending',
      'reviewed',
      'shortlisted',
      'rejected'
    ];

    if (!mongoose.isValidObjectId(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID'
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application status'
      });
    }

    const application = await JobApplication.findByIdAndUpdate(
      applicationId,
      { status },
      {
        new: true,
        runValidators: true
      }
    ).select('-sessionId -__v');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      application
    });

  } catch (error) {
    console.error('Application status update error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update application status'
    });
  }
});
module.exports = router;
