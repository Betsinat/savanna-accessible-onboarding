
import React, { useState } from 'react';
import JobPostingForm from './JobPostingForm';

export default function EmployerDashboard() {
  const [publishedJob, setPublishedJob] = useState(null);

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white px-6 py-10 md:px-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <p className="text-sm font-semibold tracking-widest text-blue-400 mb-3">
            SAVANNA EMPLOYER PORTAL
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold">
                Make your workplace more accessible.
              </h1>

              <p className="text-gray-400 mt-3 leading-relaxed max-w-2xl">
                Publish opportunities and let candidates know which
                workplace accommodations your organization provides.
              </p>
            </div>

            <span className="inline-flex items-center w-fit px-3 py-2 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold">
              Hackathon Demo
            </span>
          </div>
        </header>

        <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-5 mb-8">
          <h2 className="font-semibold text-blue-200 mb-2">
            How it works
          </h2>

          <p className="text-sm text-gray-300 leading-relaxed">
            Add a job opportunity, describe the role, and select the
            accommodations your organization offers. Your published
            opportunity will become available in the Job Board, where
            candidates can discover jobs that match their needs.
          </p>
        </div>

        <JobPostingForm onJobPublished={setPublishedJob} />

        {publishedJob && (
          <section
            role="status"
            className="mt-8 bg-emerald-950/20 border border-emerald-800/50 rounded-xl p-5"
          >
            <p className="text-emerald-300 font-semibold">
              Your job has been published!
            </p>

            <p className="text-white mt-2 font-medium">
              {publishedJob.title}
            </p>

            <p className="text-sm text-gray-400">
              {publishedJob.company}
            </p>

            <p className="text-sm text-gray-400 mt-2">
              Switch to the Job Board to see your new opportunity.
            </p>
          </section>
        )}

        <p className="text-xs text-gray-500 mt-8 leading-relaxed">
          This is an open demo interface for hackathon evaluation.
          In production, employer access would be handled by the
          authenticated host platform.
        </p>
      </div>
    </div>
  );
}
