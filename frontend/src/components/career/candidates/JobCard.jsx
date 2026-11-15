import React, { useState } from 'react';
import { useI18n } from '../../../i18n/I18nContext';
import { getAccommodationLabelKey } from '../../steps/accommodations';

export default function JobCard({ job, onViewDetails }) {
  const { t } = useI18n();
  const [showDetails, setShowDetails] = useState(false);

  const accommodations = job.offeredAccommodations || [];
  const requirements = job.requirements || [];

  return (
    <article className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg hover:border-gray-700 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-white">{job.title}</h2>
          {job.company && (
            <p className="text-blue-300 font-medium mt-1">{job.company}</p>
          )}
          {job.location && (
            <p className="text-sm text-gray-400 mt-2">{job.location}</p>
          )}
        </div>

        <span className="text-xs font-semibold text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full whitespace-nowrap">
          {t('jobs.active')}
        </span>
      </div>

      <p className="text-sm text-gray-300 leading-relaxed mt-5">
        {job.description}
      </p>

      {accommodations.length > 0 && (
        <section className="mt-6">
          <h3 className="text-sm font-semibold text-gray-200 mb-3">
            {t('jobs.accommodations')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {accommodations.map((item) => {
              const labelKey = getAccommodationLabelKey(item);
              return (
                <span
                  key={item}
                  className="text-xs bg-emerald-400/10 border border-emerald-400/20 text-emerald-200 px-3 py-2 rounded-lg"
                >
                  {labelKey ? t(`wizard.accommodations.${labelKey}`) : item}
                </span>
              );
            })}
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
            {showDetails ? t('jobs.hideRequirements') : t('jobs.viewRequirements')}
            <span aria-hidden="true" className="ms-2">
              {showDetails ? '−' : '+'}
            </span>
          </button>

          {showDetails && (
            <ul className="mt-3 space-y-2 list-disc list-inside text-sm text-gray-300">
              {requirements.map((requirement, index) => (
                <li key={`${requirement}-${index}`}>{requirement}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-6 pt-5 border-t border-gray-800">
        <button
          type="button"
          onClick={() => onViewDetails?.(job)}
          className="w-full sm:w-auto px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition"
        >
          {t('jobs.details')}
        </button>
      </div>
    </article>
  );
}