
import { fetchJobs, applyToJob } from './api';

// Retrieve active jobs, optionally filtered by candidate accommodations.
export const getJobs = async ({ sessionId, match = 'any' } = {}) => {
  const params = { match };

  if (sessionId) {
    params.sessionId = sessionId;
  }

  const data = await fetchJobs(params);

  if (!data.success) {
    throw new Error(data.message || 'Failed to retrieve jobs');
  }

  return data.jobs;
};

// Submit a candidate's application.
export const submitJobApplication = async (payload) => {
  const data = await applyToJob(payload);

  if (!data.success) {
    throw new Error(data.message || 'Failed to submit application');
  }

  return data;
};
