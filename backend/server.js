
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const candidateRoutes = require('./routes/candidates');
const jobRoutes = require('./routes/jobs');
const supportRequestRoutes = require('./routes/supportRequests');
const onboardingRoutes = require('./routes/onboarding');

const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Global middleware

app.use(cors());
app.use(express.json());
const openapiDocument = YAML.parse(
  fs.readFileSync(path.join(__dirname, 'openapi.yaml'), 'utf8')
);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

app.get('/openapi.json', (req, res) => {
  res.json(openapiDocument);
});
// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'active',
    message: 'Savanna Onboarding API is running',
    database: mongoose.connection.readyState === 1
      ? 'connected'
      : 'disconnected'
  });
});

// API routes
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api', jobRoutes);
app.use('/api/support-requests', supportRequestRoutes);

// Start server
const startServer = async () => {
  try {
    if (process.env.MONGO_URI) {
      await connectDB();
    } else {
      console.warn('MONGO_URI not set. Starting without database.');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
