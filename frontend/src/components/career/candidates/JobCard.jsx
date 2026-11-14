
import React, { useState } from 'react';

export default function JobCard({ job }) {
  const [showDetails, setShowDetails] = useState(false);

  const accommodations = job.offeredAccommodations || [];
  const requirements = job.requirements || [];

  return (
    <article className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">
            {job.title}
          </h2>

          {job.location && (
            <p className="text-sm text-gray-400">
              <span aria-hidden="true">📍 </span>
              {job.location}
            </p>
          )}

          <p className="text-sm text-gray-300 leading-relaxed">
            {job.description}
          </p>
        </div>

        <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full whitespace-nowrap">
          Active
        </span>
      </div>

      {accommodations.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-2">
            Workplace accommodations
          </h3>

          <div className="flex flex-wrap gap-2">
            {accommodations.map((item) => (
              <span
                key={item}
                className="text-xs bg-gray-950 border border-gray-700 text-emerald-300 px-3 py-1.5 rounded-lg"
              >
                {item.replaceAll('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowDetails((previous) => !previous)}
        aria-expanded={showDetails}
        className="mt-5 text-sm font-semibold text-blue-400 hover:text-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 rounded"
      >
        {showDetails ? 'Hide details' : 'View requirements and details'}
      </button>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <h3 className="text-sm font-semibold text-white mb-2">
            Requirements
          </h3>

          {requirements.length > 0 ? (
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
              {requirements.map((requirement, index) => (
                <li key={`${index}-${requirement}`}>
                  {requirement}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">
              No specific requirements listed.
            </p>
          )}
        </div>
      )}
    </article>
  );
}
