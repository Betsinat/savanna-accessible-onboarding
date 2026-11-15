
import React, { useState } from 'react';

const accommodationLabels = {
  screen_reader_compatible: 'Screen reader compatible',
  flexible_hours: 'Flexible working hours',
  remote_work: 'Remote work',
  captioned_meetings: 'Captioned meetings'
};

export default function JobCard({ job }) {
  const [showDetails, setShowDetails] = useState(false);

  const accommodations = job.offeredAccommodations || [];
  const requirements = job.requirements || [];

  return (
    <article className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg hover:border-gray-700 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-white">
            {job.title}
          </h2>

          {job.company && (
            <p className="text-blue-300 font-medium mt-1">
              {job.company}
            </p>
          )}

          {job.location && (
            <p className="text-sm text-gray-400 mt-2">
              <span aria-hidden="true">📍 </span>
              {job.location}
            </p>
          )}
        </div>

        <span className="text-xs font-semibold text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full whitespace-nowrap">
          Active
        </span>
      </div>

      <p className="text-sm text-gray-300 leading-relaxed mt-5">
        {job.description}
      </p>

      {accommodations.length > 0 && (
        <section className="mt-6">
          <h3 className="text-sm font-semibold text-gray-200 mb-3">
            Workplace accommodations
          </h3>

          <div className="flex flex-wrap gap-2">
            {accommodations.map((item) => (
              <span
                key={item}
                className="text-xs bg-emerald-400/10 border border-emerald-400/20 text-emerald-200 px-3 py-2 rounded-lg"
              >
                {accommodationLabels[item] || item.replaceAll('_', ' ')}
              </span>
            ))}
          </div>
        </section>
      )}

      {requirements.length > 0 && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setShowDetails((previous) => !previous)}
            aria-expanded={showDetails}
            className="text-sm font-semibold text-blue-300 hover:text-blue-200 transition-colors"
          >
            {showDetails ? 'Hide requirements' : 'View requirements'}
            <span aria-hidden="true" className="ml-2">
              {showDetails ? '−' : '+'}
            </span>
          </button>

          {showDetails && (
            <ul className="mt-3 space-y-2 list-disc list-inside text-sm text-gray-300">
              {requirements.map((requirement, index) => (
                <li key={`${requirement}-${index}`}>
                  {requirement}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {accommodations.length === 0 && requirements.length === 0 && (
        <p className="text-xs text-gray-400 mt-5">
          More job details may be provided by the employer.
        </p>
      )}
    </article>
  );
}
