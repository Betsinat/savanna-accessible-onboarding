import React from 'react';
import JobCard from './JobCard';
import { useI18n } from '../../../i18n/I18nContext';

export default function JobList({ jobs, onViewDetails }) {
  const { t } = useI18n();
  if (jobs.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-2xl">
        <h2 className="text-lg font-semibold text-white">
          {t('jobs.noneAvailable')}
        </h2>
        <p className="text-sm text-gray-400 mt-2">
          {t('jobs.checkBack')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5">
      {jobs.map((job) => (
        <JobCard
          key={job._id}
          job={job}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}