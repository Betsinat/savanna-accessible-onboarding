import React, { useState, useEffect } from 'react';
import { fetchJobs, applyToJob } from '../services/api';

export default function JobsView({ formData, sessionId }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [applicationError, setApplicationError] = useState('');
  const [appliedJobs, setAppliedJobs] = useState({});

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setJobs(await fetchJobs());
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
        setLoadError('Unable to load job openings right now. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const handleApply = async (jobId) => {
    try {
      await applyToJob({
        jobId: String(jobId),
        sessionId,
        candidateName: String(formData.fullName || ''),
        voiceAnswers: [],
        requestedAccommodations: Array.isArray(formData.accommodationPreferences)
          ? formData.accommodationPreferences
          : [],
      });
      setAppliedJobs((prev) => ({ ...prev, [jobId]: true }));
    } catch (err) {
      console.error('Application failed:', err);
      setApplicationError('Failed to submit application. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white p-6 md:p-12">
      <header className="max-w-4xl mx-auto mb-8 border-b border-gray-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-blue-400">Career Gateway</h1>
          <p className="text-sm text-gray-400">Welcome, {formData.fullName || 'Candidate'}! Browse accessible career opportunities below.</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        {loadError && (
          <p className="text-red-400 text-sm font-medium" role="alert">{loadError}</p>
        )}
        {applicationError && (
          <p className="text-red-400 text-sm font-medium" role="alert">{applicationError}</p>
        )}

        {loading ? (
          <p className="text-gray-400 text-center py-12">Loading accessible job openings...</p>
        ) : loadError ? null : jobs.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No open positions available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job) => {
              const isApplied = appliedJobs[job._id];
              return (
                <div key={job._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-white">{job.title}</h2>
                    <p className="text-sm text-gray-300">{job.location}</p>
                    <p className="text-xs text-gray-400 max-w-xl">{job.description}</p>
                    
                    {/* Accommodation Badges */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {job.offeredAccommodations?.map((acc) => (
                        <span key={acc} className="text-xs bg-gray-950 border border-gray-800 text-emerald-400 px-2.5 py-1 rounded-lg">
                          ✓ {acc.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApply(job._id)}
                    disabled={isApplied}
                    className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                      isApplied
                        ? 'bg-emerald-600/20 border border-emerald-500 text-emerald-300 cursor-default'
                        : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/40'
                    }`}
                  >
                    {isApplied ? 'Application Submitted ✓' : 'Apply with Profile'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}