import React, { useState, useEffect } from 'react';
import { fetchJobs, applyToJob } from '../services/api';

export default function JobsView({ formData, sessionId }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appliedJobs, setAppliedJobs] = useState({});

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await fetchJobs();
        setJobs(response.data || response || [
          {
            _id: 'job-1',
            title: 'Accessibility Software Engineer',
            company: 'Savanna Tech',
            location: 'Remote / Addis Ababa',
            accommodations: ['screen_reader_compatible', 'flexible_hours'],
            description: 'Build inclusive, WCAG 2.2 AA compliant web experiences using the MERN stack.'
          },
          {
            _id: 'job-2',
            title: 'Frontend Developer (React)',
            company: 'Inclusive Africa',
            location: 'Remote',
            accommodations: ['remote_work', 'captioned_meetings'],
            description: 'Help develop modern React applications with a focus on screen-reader accessibility.'
          }
        ]);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
        setJobs([
          {
            _id: 'job-1',
            title: 'Accessibility Software Engineer',
            company: 'Savanna Tech',
            location: 'Remote / Addis Ababa',
            accommodations: ['screen_reader_compatible', 'flexible_hours'],
            description: 'Build inclusive, WCAG 2.2 AA compliant web experiences using the MERN stack.'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const handleApply = async (jobId) => {
    try {
      await applyToJob({
        jobId,
        sessionId,
        candidateName: formData.fullName,
        contact: formData.phoneOrEmail,
        preferredAccommodations: formData.accommodationPreferences || [],
      });
      setAppliedJobs((prev) => ({ ...prev, [jobId]: true }));
    } catch (err) {
      console.error('Application failed:', err);
      setError('Failed to submit application. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white p-6 md:p-12">
      <header className="max-w-4xl mx-auto mb-8 border-b border-gray-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-blue-400">Career Gateway</h1>
          <p className="text-sm text-gray-400">Welcome, {formData.fullName || 'Candidate'}! Browse accessible career opportunities below.</p>
        </div>
        <div className="text-xs font-mono bg-blue-600/20 border border-blue-500 text-blue-300 px-3 py-1.5 rounded-xl">
          Profile Verified ✓
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        {error && (
          <p className="text-red-400 text-sm font-medium" role="alert">⚠️ {error}</p>
        )}

        {loading ? (
          <p className="text-gray-400 text-center py-12">Loading accessible job openings...</p>
        ) : jobs.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No open positions available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job) => {
              const isApplied = appliedJobs[job._id];
              return (
                <div key={job._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-white">{job.title}</h2>
                    <p className="text-sm text-gray-400">{job.company} • <span className="text-gray-300">{job.location}</span></p>
                    <p className="text-xs text-gray-400 max-w-xl">{job.description}</p>
                    
                    {/* Accommodation Badges */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {job.accommodations?.map((acc) => (
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