
import React, { useState } from 'react';
import useJobs from '../hooks/useJobs';
import JobList from './JobList';
import JobDetails from './JobDetails';
import JobApplications from './JobApplications';

export default function CareerGateway({ formData = {}, sessionId }) {
  const [match, setMatch] = useState('any');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [notice, setNotice] = useState('');

  const { jobs, loading, error, refreshJobs } = useJobs(sessionId, match);

  const handleApply = () => {
    if (!sessionId) {
      setNotice('Please complete candidate registration before applying for a job.');
      return;
    }

    setNotice('');
    setIsApplying(true);
  };

  const handleApplicationSubmitted = () => {
    setIsApplying(false);
    setSelectedJob(null);
    setNotice('Your application was submitted successfully!');
  };

  const handleBackToJobs = () => {
    setSelectedJob(null);
    setIsApplying(false);
    setNotice('');
  };

  if (isApplying && selectedJob) {
    return (
      <JobApplications
        job={selectedJob}
        sessionId={sessionId}
        candidateName={formData.fullName}
        requestedAccommodations={formData.accommodationPreferences || []}
        onCancel={() => setIsApplying(false)}
        onSubmitted={handleApplicationSubmitted}
      />
    );
  }

  if (selectedJob) {
    return (
      <JobDetails
        job={selectedJob}
        onBack={handleBackToJobs}
        onApply={handleApply}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white px-6 py-10 md:px-12">
      <header className="max-w-4xl mx-auto mb-10">
        <p className="text-sm font-semibold text-blue-400 mb-2">
          SAVANNA CAREER GATEWAY
        </p>

        <h1 className="text-3xl font-extrabold">
          Find opportunities that work for you.
        </h1>

        <p className="text-gray-400 mt-3">
          Welcome, {formData.fullName || 'Candidate'}.
          Explore accessible employment opportunities.
        </p>
      </header>

      <main className="max-w-4xl mx-auto">
        {notice && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-blue-200"
          >
            {notice}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 id="available-opportunities-heading" className="text-xl font-bold">
              Available opportunities
            </h2>

            {!loading && (
              <p className="text-sm text-gray-400 mt-1">
                {jobs.length} {jobs.length === 1 ? 'position' : 'positions'} found
              </p>
            )}
          </div>

          <label className="text-sm text-gray-300 flex flex-col gap-2">
            Accommodation matching

            <select
              value={match}
              onChange={(event) => setMatch(event.target.value)}
              className="bg-gray-900 border border-gray-500 rounded-lg px-4 py-3 text-white"
            >
              <option value="any">Match any preference</option>
              <option value="all">Match all preferences</option>
            </select>
          </label>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-16" role="status">
            Loading available opportunities...
          </p>
        ) : error ? (
          <div className="bg-red-950/30 border border-red-900 rounded-xl p-5">
            <p className="text-red-300" role="alert">
              {error}
            </p>

            <button
              type="button"
              onClick={refreshJobs}
              className="mt-4 px-4 py-2 rounded-lg border border-gray-500 bg-gray-800 hover:bg-gray-700 text-white"
            >
              Try again
            </button>
          </div>
        ) : (
          <JobList
            jobs={jobs}
            onViewDetails={(job) => {
              setNotice('');
              setSelectedJob(job);
            }}
          />
        )}
      </main>
    </div>
  );
}
