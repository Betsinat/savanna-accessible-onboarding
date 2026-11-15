
import React, { useState } from 'react';
import JobPostingForm from './JobPostingForm';
import EmployerApplications from './EmployerApplications';
import { useI18n } from '../../i18n/I18nContext';

export default function EmployerDashboard() {
  const { t } = useI18n();
  const [publishedJob, setPublishedJob] = useState(null);

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white px-6 py-10 md:px-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <p className="text-sm font-semibold tracking-widest text-blue-400 mb-3">
            {t('employer.portal')}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold">
                {t('employer.title')}
              </h1>

              <p className="text-gray-400 mt-3 leading-relaxed max-w-2xl">
                {t('employer.intro')}
              </p>
            </div>

            <span className="inline-flex items-center w-fit px-3 py-2 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold">
              {t('employer.demo')}
            </span>
          </div>
        </header>

        <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-5 mb-8">
          <h2 className="font-semibold text-blue-200 mb-2">
            {t('employer.howItWorks')}
          </h2>

          <p className="text-sm text-gray-300 leading-relaxed">
            {t('employer.howItWorksText')}
          </p>
        </div>

        <JobPostingForm onJobPublished={setPublishedJob} />
        <EmployerApplications />

        {publishedJob && (
          <section
            role="status"
            className="mt-8 bg-emerald-950/20 border border-emerald-800/50 rounded-xl p-5"
          >
            <p className="text-emerald-300 font-semibold">
              {t('employer.published')}
            </p>

            <p className="text-white mt-2 font-medium">
              {publishedJob.title}
            </p>

            <p className="text-sm text-gray-400">
              {publishedJob.company}
            </p>

            <p className="text-sm text-gray-400 mt-2">
              {t('employer.switchToJobs')}
            </p>
          </section>
        )}

        <p className="text-xs text-gray-400 mt-8 leading-relaxed">
          {t('employer.disclaimer')}
        </p>
      </div>
    </div>
  );
}
