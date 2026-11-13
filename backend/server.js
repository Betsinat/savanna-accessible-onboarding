const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection (MongoDB)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/savanna-onboarding', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', message: 'Savanna Onboarding API is running' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const OnboardingDraft = require('./models/OnboardingDraft');

// Save or update onboarding form draft (Zero-timeout sync)
app.post('/api/onboarding/draft', async (req, res) => {
  try {
    const { sessionId, currentStep, formData } = req.body;
    
    const draft = await OnboardingDraft.findOneAndUpdate(
      { sessionId },
      { currentStep, formData, lastUpdated: Date.now() },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, draft });
  } catch (err) {
    console.error('Error syncing draft:', err);
    res.status(500).json({ success: false, error: 'Failed to sync draft' });
  }
});