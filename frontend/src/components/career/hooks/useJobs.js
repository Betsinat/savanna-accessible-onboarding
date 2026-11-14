
import { useCallback, useEffect, useState } from 'react';
import { getJobs } from '../../../services/careerService';

const useJobs = (sessionId, match = 'any') => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getJobs({ sessionId, match });
      setJobs(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Something went wrong while loading jobs.'
      );
    } finally {
      setLoading(false);
    }
  }, [sessionId, match]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  return {
    jobs,
    loading,
    error,
    refreshJobs: loadJobs
  };
};

export default useJobs;
