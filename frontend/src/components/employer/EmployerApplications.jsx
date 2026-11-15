
import React, { useEffect, useState } from 'react';
import {
  fetchJobs,
  fetchJobApplicants,
  updateApplicationStatus
} from '../../services/api';
import { useI18n } from '../../i18n/I18nContext';
import { formatEthiopianDate } from '../../utils/ethiopia';

const statuses = ['pending', 'reviewed', 'shortlisted', 'rejected'];

export default function EmployerApplications() {
  const { t, lang } = useI18n();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applications, setApplications] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await fetchJobs();
        setJobs(data.jobs || []);
      } catch (err) {
        setError(t('employer.loadJobsError'));
      } finally {
        setLoadingJobs(false);
      }
    };

    loadJobs();
  }, [t]);

  useEffect(() => {
    if (!selectedJobId) {
      setApplications([]);
      return;
    }

    const loadApplicants = async () => {
      setLoadingApplications(true);
      setError('');

      try {
        const data = await fetchJobApplicants(selectedJobId);
        setApplications(data.applications || []);
      } catch (err) {
        setError(t('employer.loadApplicantsError'));
      } finally {
        setLoadingApplications(false);
      }
    };

    loadApplicants();
  }, [selectedJobId, t]);

  const handleStatusChange = async (applicationId, status) => {
    setUpdatingId(applicationId);
    setError('');

    try {
      await updateApplicationStatus(applicationId, status);

      setApplications(current =>
        current.map(application =>
          application._id === applicationId
            ? { ...application, status }
            : application
        )
      );
    } catch (err) {
      setError(t('employer.statusError'));
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <section className="mt-12">
      <div className="mb-6">
        <p className="text-sm font-semibold tracking-widest text-blue-400 mb-2">
          {t('employer.management')}
        </p>

        <h2 className="text-2xl font-bold text-white">
          {t('employer.reviewApplications')}
        </h2>

        <p className="text-gray-400 mt-2">
          {t('employer.selectJobHelp')}
        </p>
      </div>

      <div className="bg-[#151b27] border border-gray-800 rounded-xl p-5">
        <label
          htmlFor="employer-job-select"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          {t('employer.selectJob')}
        </label>

        {loadingJobs ? (
          <p className="text-gray-400">{t('employer.loadingJobs')}</p>
        ) : jobs.length === 0 ? (
          <p className="text-gray-400">
            {t('employer.noJobs')}
          </p>
        ) : (
          <select
            id="employer-job-select"
            value={selectedJobId}
            onChange={event => setSelectedJobId(event.target.value)}
            className="w-full bg-[#0b0e14] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('employer.chooseJob')}</option>
            {jobs.map(job => (
              <option key={job._id} value={job._id}>
                {job.title} — {job.company}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <p role="alert" className="text-red-400 mt-4">
          {error}
        </p>
      )}

      {selectedJobId && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {t('employer.applicants', { count: applications.length })}
          </h3>

          {loadingApplications ? (
            <p className="text-gray-400">{t('employer.loadingApplicants')}</p>
          ) : applications.length === 0 ? (
            <div className="bg-[#151b27] border border-gray-800 rounded-xl p-6 text-gray-400">
              {t('employer.noApplicants')}
            </div>
          ) : (
            <div className="space-y-5">
              {applications.map(application => (
                <article
                  key={application._id}
                  className="bg-[#151b27] border border-gray-800 rounded-xl p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-semibold text-white">
                        {application.candidateName}
                      </h4>

                      <p className="text-sm text-gray-400 mt-1">
                        {t('employer.submitted')}{' '}
                        {application.submittedAt
                            ? formatEthiopianDate(new Date(application.submittedAt), lang)
                            : t('employer.dateUnavailable')}
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor={`status-${application._id}`}
                        className="block text-xs text-gray-400 mb-1"
                      >
                        {t('employer.applicationStatus')}
                      </label>

                      <select
                        id={`status-${application._id}`}
                        value={application.status || 'pending'}
                        disabled={updatingId === application._id}
                        onChange={event =>
                          handleStatusChange(
                            application._id,
                            event.target.value
                          )
                        }
                        className="bg-[#0b0e14] border border-gray-700 rounded-lg p-2 text-white disabled:opacity-50"
                      >
                        {statuses.map(status => (
                          <option key={status} value={status}>
                            {t(`employer.status.${status}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-5">
                    <h5 className="text-sm font-semibold text-blue-300 mb-2">
                      {t('employer.requestedAccommodations')}
                    </h5>

                    {application.requestedAccommodations?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {application.requestedAccommodations.map(item => (
                          <span
                            key={item}
                            className="text-xs bg-blue-950/50 text-blue-200 border border-blue-900 rounded-full px-3 py-1"
                          >
                            {item.replaceAll('_', ' ')}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">
                        {t('employer.noAccommodations')}
                      </p>
                    )}
                  </div>

                  <div className="mt-5">
                    <h5 className="text-sm font-semibold text-blue-300 mb-3">
                      {t('employer.candidateResponses')}
                    </h5>

                    {application.voiceAnswers?.length > 0 ? (
                      <div className="space-y-3">
                        {application.voiceAnswers.map((answer, index) => (
                          <div
                            key={`${answer.questionId}-${index}`}
                            className="bg-[#0b0e14] rounded-lg p-4"
                          >
                            <p className="text-xs text-gray-500 mb-2">
                              {t('employer.question', { id: answer.questionId })}
                            </p>

                            <p className="text-sm text-gray-200 leading-relaxed">
                              {answer.audioTranscript}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">
                        {t('employer.noResponses')}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
