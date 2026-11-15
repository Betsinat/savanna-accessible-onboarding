import React from 'react';
import { useI18n } from '../../../i18n/I18nContext';
import { getAccommodationLabelKey } from '../../steps/accommodations';

export default function JobDetails({ job, onBack, onApply }) {
  const { t } = useI18n();
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
        ← {t('jobs.back')}
      </button>

      <header>
        <span className="text-xs font-semibold text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full">
          {t('jobs.activePosition')}
        </span>

        <h1 className="text-3xl font-bold text-white mt-5">
          {job.title}
        </h1>

        <p className="text-lg text-blue-300 font-medium mt-2">
          {job.company}
        </p>

        {job.location && (
          <p className="text-sm text-gray-400 mt-2">
            {t('jobs.location', { location: job.location })}
          </p>
        )}
      </header>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-white mb-3">
          {t('jobs.about')}
        </h2>
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
          {job.description}
        </p>
      </div>

      {requirements.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-white mb-3">
            {t('jobs.requirements')}
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
          {t('jobs.accommodations')}
        </h2>

        {accommodations.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {accommodations.map((item) => {
              const labelKey = getAccommodationLabelKey(item);
              return (
                <span
                  key={item}
                  className="text-sm bg-emerald-400/10 border border-emerald-400/20 text-emerald-200 px-3 py-2 rounded-lg"
                >
                  {labelKey ? t(`wizard.accommodations.${labelKey}`) : item}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            {t('jobs.none')}
          </p>
        )}
      </section>

      <div className="mt-10 pt-6 border-t border-gray-800">
        <button
          type="button"
          onClick={onApply}
          className="w-full sm:w-auto px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white transition"
        >
          {t('jobs.apply')}
        </button>
      </div>
    </section>
  );
}