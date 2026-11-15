
import React, { useRef, useState } from 'react';
import { createEmployerJob } from '../../services/api';
import { useI18n } from '../../i18n/I18nContext';

const accommodationOptions = [
  {
    id: 'screen_reader_compatible',
    labelKey: 'screenReaderCompatible'
  },
  {
    id: 'flexible_hours',
    labelKey: 'flexibleHours'
  },
  {
    id: 'remote_work',
    labelKey: 'remoteWork'
  },
  {
    id: 'captioned_meetings',
    labelKey: 'captionedMeetings'
  }
];

const initialForm = {
  title: '',
  company: '',
  description: '',
  location: '',
  requirements: '',
  offeredAccommodations: []
};

export default function JobPostingForm({ onJobPublished }) {
  const { t } = useI18n();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const titleRef = useRef(null);
  const companyRef = useRef(null);
  const descriptionRef = useRef(null);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleAccommodationChange = (id) => {
    setForm((previous) => {
      const selected = previous.offeredAccommodations;

      return {
        ...previous,
        offeredAccommodations: selected.includes(id)
          ? selected.filter((item) => item !== id)
          : [...selected, id]
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const firstMissingField = [
      { value: form.title, ref: titleRef },
      { value: form.company, ref: companyRef },
      { value: form.description, ref: descriptionRef },
    ].find(({ value }) => !value.trim());

    if (firstMissingField) {
      setError(t('jobForm.missing'));
      firstMissingField.ref.current?.focus();
      return;
    }

    const payload = {
      title: form.title.trim(),
      company: form.company.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      requirements: form.requirements
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
      offeredAccommodations: form.offeredAccommodations
    };

    try {
      setLoading(true);

      const response = await createEmployerJob(payload);

      setSuccess(t('jobForm.published'));
      setForm(initialForm);

      if (onJobPublished) {
        onJobPublished(response.job);
      }
    } catch (err) {
      setError(
        t('jobForm.error')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-labelledby="job-form-heading"
      aria-describedby="job-form-help"
      className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 space-y-6"
    >
      <div>
        <h2 id="job-form-heading" className="text-2xl font-bold text-white">
          {t('jobForm.title')}
        </h2>
        <p id="job-form-help" className="text-gray-400 text-sm mt-2">
          {t('jobForm.help')}
        </p>
        <p className="mt-2 text-sm text-gray-400">
          {t('jobForm.requiredHelp')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="job-title"
            className="block text-sm font-medium text-gray-200 mb-2"
          >
            {t('jobForm.jobTitle')}
          </label>
          <input
            id="job-title"
            ref={titleRef}
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            required
            aria-invalid={Boolean(error && !form.title.trim())}
            aria-describedby={error && !form.title.trim() ? 'job-form-error' : undefined}
            maxLength={150}
            placeholder={t('jobForm.titlePlaceholder')}
            className="w-full bg-gray-950 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="company-name"
            className="block text-sm font-medium text-gray-200 mb-2"
          >
            {t('jobForm.company')}
          </label>
          <input
            id="company-name"
            ref={companyRef}
            name="company"
            type="text"
            value={form.company}
            onChange={handleChange}
            required
            aria-invalid={Boolean(error && !form.company.trim())}
            aria-describedby={error && !form.company.trim() ? 'job-form-error' : undefined}
            maxLength={150}
            placeholder={t('jobForm.companyPlaceholder')}
            className="w-full bg-gray-950 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="job-description"
          className="block text-sm font-medium text-gray-200 mb-2"
        >
          {t('jobForm.description')}
        </label>
        <textarea
          id="job-description"
          ref={descriptionRef}
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          aria-invalid={Boolean(error && !form.description.trim())}
          aria-describedby={error && !form.description.trim() ? 'job-form-error' : undefined}
          maxLength={5000}
          rows={5}
          placeholder={t('jobForm.descriptionPlaceholder')}
          className="w-full bg-gray-950 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="job-location"
          className="block text-sm font-medium text-gray-200 mb-2"
        >
          {t('jobForm.location')}
        </label>
        <input
          id="job-location"
          name="location"
          type="text"
          value={form.location}
          onChange={handleChange}
          placeholder={t('jobForm.locationPlaceholder')}
          className="w-full bg-gray-950 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="job-requirements"
          className="block text-sm font-medium text-gray-200 mb-2"
        >
          {t('jobForm.requirements')}
        </label>
        <textarea
          id="job-requirements"
          name="requirements"
          value={form.requirements}
          onChange={handleChange}
          rows={4}
          placeholder={t('jobForm.requirementsPlaceholder')}
          className="w-full bg-gray-950 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-2">
          {t('jobForm.requirementsHelp')}
        </p>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-white mb-2">
          {t('jobForm.offered')}
        </legend>
        <p className="text-sm text-gray-400 mb-4">
          {t('jobForm.offeredHelp')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {accommodationOptions.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-3 bg-gray-950 border border-gray-800 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition"
            >
              <input
                type="checkbox"
                checked={form.offeredAccommodations.includes(option.id)}
                onChange={() => handleAccommodationChange(option.id)}
                className="w-4 h-4 accent-blue-500"
              />
              <span className="text-sm text-gray-200">
                {t(`wizard.accommodations.${option.labelKey}`)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <p id="job-form-error" role="alert" className="text-sm text-red-400 bg-red-950/30 p-3 rounded-lg">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="text-sm text-emerald-400 bg-emerald-950/30 p-3 rounded-lg">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed text-white font-semibold transition"
      >
        {loading ? t('jobForm.publishing') : t('jobForm.publish')}
      </button>
    </form>
  );
}
