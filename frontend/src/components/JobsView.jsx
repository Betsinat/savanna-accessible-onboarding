
import React, { useState, useEffect } from 'react';
import { fetchJobs } from '../services/api';

export default function JobsView({ formData = {}, sessionId }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetchJobs();

        if (!response.success || !Array.isArray(response.jobs)) {
          throw new Error(
            response.message || 'Invalid jobs response from server.'
          );
        }

        setJobs(response.jobs);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to load job opportunities. Please try again.'
        );
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const formatAccommodation = (accommodation) =>
    accommodation.replaceAll('_', ' ');

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white p-6 md:p-12">
      <header className="max-w-4xl mx-auto mb-8 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-blue-400">
            Career Gateway
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Welcome, {formData.fullName || 'Candidate'}! Browse accessible
            career opportunities below.
          </p>
        </div>
      </header>

      <section aria-label="Job opportunities" className="max-w-4xl mx-auto space-y-6">
        {loading ? (
          <p className="text-gray-400 text-center py-12" role="status">
            Loading accessible job openings...
          </p>
        ) : error ? (
          <div className="bg-red-950/30 border border-red-900 rounded-xl p-5">
            <p className="text-red-300" role="alert">
              {error}
            </p>
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-gray-400 text-center py-12">
            No open positions available at the moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job) => (
              <article
                key={job._id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl"
              >
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-white">
                    {job.title}
                  </h2>

                  {job.location && (
                    <p className="text-sm text-gray-300">
                      <span aria-hidden="true">📍 </span>
                      {job.location}
                    </p>
                  )}

                  <p className="text-sm text-gray-300 leading-relaxed">
                    {job.description}
                  </p>

                  {job.requirements?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-2">
                        Requirements
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                        {job.requirements.map((requirement, index) => (
                          <li key={`${index}-${requirement}`}>
                            {requirement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {job.offeredAccommodations?.length > 0 && (
                    <div className="pt-2">
                      <h3 className="text-sm font-semibold text-gray-200 mb-2">
                        Workplace accommodations
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {job.offeredAccommodations.map((accommodation) => (
                          <span
                            key={accommodation}
                            className="text-xs bg-gray-950 border border-gray-800 text-emerald-400 px-2.5 py-1.5 rounded-lg"
                          >
                            ✓ {formatAccommodation(accommodation)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-400 pt-2">
                    Application form coming soon.
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
