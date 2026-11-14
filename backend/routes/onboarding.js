
const express = require('express');
const crypto = require('crypto');

const OnboardingDraft = require('../models/onboardingDraft');
const smsProvider = require('../services/smsProvider');

const router = express.Router();

const TOKEN_EXPIRY_DAYS = 30;
const TOKEN_EXPIRY_MS = TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

// Hash a resume token using SHA-256
const hashToken = (token) => {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
};

// POST /api/onboarding/save
router.post('/save', async (req, res) => {
  try {
    const {
      sessionId,
      currentStep,
      formData,
      requestSmsLink,
      phoneNumber
    } = req.body;

    // Validate request
    if (
      !sessionId ||
      typeof sessionId !== 'string' ||
      !Number.isInteger(currentStep) ||
      currentStep < 1 ||
      !formData ||
      typeof formData !== 'object' ||
      Array.isArray(formData)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid sessionId, currentStep, and formData are required'
      });
    }

    if (requestSmsLink && !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'A phone number is required to send a resume link'
      });
    }

    // Prepare draft update
    const updateData = {
      currentStep,
      formData,
      lastUpdated: new Date()
    };

    let resumeToken;

    // Generate token only when SMS is requested
    if (requestSmsLink) {
      resumeToken = crypto.randomBytes(32).toString('hex');

      updateData.resumeTokenHash = hashToken(resumeToken);
      updateData.resumeTokenExpiresAt = new Date(
        Date.now() + TOKEN_EXPIRY_MS
      );
    }

    // Create or update the draft
    const draft = await OnboardingDraft.findOneAndUpdate(
      { sessionId },
      { $set: updateData },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    );

    // Send resume link through the SMS provider
    if (requestSmsLink) {
      const frontendUrl =
        process.env.FRONTEND_URL || 'http://localhost:3000';

      const resumeUrl =
        `${frontendUrl}/resume?token=${encodeURIComponent(resumeToken)}`;

      await smsProvider.sendResumeLink({
        phoneNumber,
        resumeUrl
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Onboarding progress saved successfully',
      smsRequested: Boolean(requestSmsLink),
      draft
    });

  } catch (error) {
    console.error('Error saving onboarding progress:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to save onboarding progress'
    });
  }
});

// GET /api/onboarding/resume/:token
router.get('/resume/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume token'
      });
    }

    // Hash the supplied token before searching the database
    const tokenHash = hashToken(token);

    const draft = await OnboardingDraft.findOne({
      resumeTokenHash: tokenHash,
      resumeTokenExpiresAt: { $gt: new Date() }
    }).select('-resumeTokenHash -resumeTokenExpiresAt');

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'Resume link is invalid or has expired'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Onboarding progress retrieved successfully',
      draft
    });

  } catch (error) {
    console.error('Error retrieving onboarding draft:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve onboarding progress'
    });
  }
});

module.exports = router;
