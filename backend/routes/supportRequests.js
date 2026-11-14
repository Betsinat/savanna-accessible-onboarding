
const express = require('express');
const SupportRequest = require('../models/supportRequest');

const router = express.Router();

// POST /api/support-requests
router.post('/', async (req, res) => {
  try {
    const {
      sessionId,
      supportType,
      preferredContactMethod,
      additionalNotes
    } = req.body;

    if (
      !sessionId ||
      !supportType ||
      !preferredContactMethod
    ) {
      return res.status(400).json({
        success: false,
        message: 'Required support request information is missing'
      });
    }

    const supportRequest = new SupportRequest({
      sessionId,
      supportType,
      preferredContactMethod,
      additionalNotes
    });

    await supportRequest.save();

    return res.status(201).json({
      success: true,
      message: 'Support request submitted successfully',
      supportRequest
    });

  } catch (error) {
    console.error('Support request error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid support request information',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to submit support request'
    });
  }
});

module.exports = router;
