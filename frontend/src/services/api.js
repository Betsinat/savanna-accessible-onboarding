import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const saveOnboardingDraft = async (payload) => {
  const response = await API.post('/onboarding/save', payload);
  return response.data;
};

export const resumeOnboardingDraft = async (token) => {
  const response = await API.get(`/onboarding/resume/${token}`);
  return response.data;
};

export const registerCandidate = async (payload) => {
  const response = await API.post('/candidates', payload);
  return response.data;
};

export const submitSupportRequest = async (payload) => {
  const response = await API.post('/support-requests', payload);
  return response.data;
};


export const fetchJobs = async (params = {}) => {
  const response = await API.get('/jobs', { params });
  return response.data;
};


export const applyToJob = async (payload) => {
  const response = await API.post('/jobs/apply', payload);
  return response.data;
};
export const createEmployerJob = async (payload) => {
  const response = await API.post('/employer/jobs', payload);
  return response.data;
};