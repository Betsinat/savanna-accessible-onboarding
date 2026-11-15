import React from 'react';

const accommodationLabels = {
  screen_reader_compatible: 'Screen reader compatible',
  flexible_hours: 'Flexible working hours',
  remote_work: 'Remote work',
  captioned_meetings: 'Captioned meetings'
};

export default function JobDetails({ job, onBack, onApply }) {
  if (!job) return null;

  const accommodations = job.offeredAccommodations || [];
  const requirements = job.requirements || [];

  return (
    <section className="max-w-4xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-blue-300 hover:text-blue-200 mb-6"
      >
        ← Back to opportunities
      </button>

      <header>
        <span className="text-xs font-semibold text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full">
          Active position
        </span>

        <h1 className="text-3xl font-bold text-white mt-5">
          {job.title}
        </h1>

        <p className="text-lg text-blue-300 font-medium mt-2">
          {job.company}
        </p>

        {job.location && (
          <p className="text-sm text-gray-400 mt-2">
            Location: {job.location}
          </p>
        )}
      </header>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-white mb-3">
          About this position
        </h2>
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
          {job.description}
        </p>
      </div>

      {requirements.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-white mb-3">
            Requirements
          </h2>
          <ul className="space-y-2 list-disc list-inside text-gray-300">
            {requirements.map((requirement, index) => (
              <li key={`${requirement}-${index}`}>{requirement}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-bold text-white mb-3">
          Workplace accommodations
        </h2>

        {accommodations.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {accommodations.map((item) => (
              <span
                key={item}
                className="text-sm bg-emerald-400/10 border border-emerald-400/20 text-emerald-200 px-3 py-2 rounded-lg"
              >
                {accommodationLabels[item] || item.replaceAll('_', ' ')}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            No specific accommodations have been listed for this position.
          </p>
        )}
      </section>

      <div className="mt-10 pt-6 border-t border-gray-800">
        <button
          type="button"
          onClick={onApply}
          className="w-full sm:w-auto px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white transition"
        >
          Apply for this position
        </button>
      </div>
    </section>
  );
}