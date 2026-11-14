
const express = require('express');
const OnboardingProfile = require('../models/onboardingProfile');

const router = express.Router();

// POST /api/candidates
router.post('/', async (req, res) => {
  try {
    const {
      sessionId,
      fullName,
      phoneOrEmail,
      idRoute,
      idDetails,
      consentGiven,
      accommodationPreferences
    } = req.body;

    // Basic request validation
    if (
      !sessionId ||
      !fullName ||
      !phoneOrEmail ||
      !idRoute ||
      !Array.isArray(accommodationPreferences)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Required candidate information is missing'
      });
    }

    // Consent is required before registration
    if (consentGiven !== true) {
      return res.status(400).json({
        success: false,
        message: 'Candidate consent is required'
      });
    }

    // Create candidate profile
    const candidate = new OnboardingProfile({
      sessionId,
      fullName,
      phoneOrEmail,
      idRoute,
      idDetails,
      consentGiven,
      accommodationPreferences
    });

    await candidate.save();

    return res.status(201).json({
      success: true,
      message: 'Candidate registered successfully',
      candidateId: candidate._id
    });

  } catch (error) {
    console.error('Candidate registration error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A candidate with this session already exists'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Candidate information is invalid',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to register candidate'
    });
  }
});

module.exports = router;
