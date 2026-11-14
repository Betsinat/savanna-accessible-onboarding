import axios from 'axios';

// Base API instance pointing to the backend
const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 1. Onboarding & Draft Persistence
 */
export const saveOnboardingDraft = async (payload) => {
  // payload: { sessionId, currentStep, formData, requestSmsLink }
  const response = await API.post('/onboarding/save', payload);
  return response.data;
};

export const resumeOnboardingDraft = async (token) => {
  const response = await API.get(`/onboarding/resume/${token}`);
  return response.data;
};

/**
 * 2. Candidate Registration
 */
export const registerCandidate = async (payload) => {
  // payload: { sessionId, fullName, phoneOrEmail, idRoute, idDetails, consentGiven, accommodationPreferences }
  const response = await API.post('/candidates', payload);
  return response.data;
};

/**
 * 3. Confidential Support Requests (Zero Medical Proof)
 */
export const submitSupportRequest = async (payload) => {
  // payload: { sessionId, supportType, preferredContactMethod, additionalNotes }
  const response = await API.post('/support-requests', payload);
  return response.data;
};

/**
 * 4. Career Gateway Job Discovery & Applications
 */
export const fetchJobs = async (params = {}) => {
  // params: { accommodations, sessionId, match, page, limit }
  const response = await API.get('/jobs', { params });
  return response.data;
};

export const applyToJob = async (payload) => {
  // payload: { sessionId, jobId, candidateName, voiceAnswers, requestedAccommodations }
  const response = await API.post('/jobs/apply', payload);
  return response.data;
};