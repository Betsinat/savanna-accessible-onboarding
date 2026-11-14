
import React, { useState } from 'react';
import { createEmployerJob } from '../../services/api';

const accommodationOptions = [
  {
    id: 'screen_reader_compatible',
    label: 'Screen Reader Compatible'
  },
  {
    id: 'flexible_hours',
    label: 'Flexible Working Hours'
  },
  {
    id: 'remote_work',
    label: 'Remote Work Enabled'
  },
  {
    id: 'captioned_meetings',
    label: 'Captioned Meetings'
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
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

    if (
      !form.title.trim() ||
      !form.company.trim() ||
      !form.description.trim()
    ) {
      setError('Please complete the job title, company, and description.');
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

      setSuccess(response.message || 'Job published successfully!');
      setForm(initialForm);

      if (onJobPublished) {
        onJobPublished(response.job);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to publish the job. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white">
          Post a job opportunity
        </h2>
        <p className="text-gray-400 text-sm mt-2">
          Share an opportunity and tell candidates which workplace
          accommodations your company offers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="job-title"
            className="block text-sm font-medium text-gray-200 mb-2"
          >
            Job title *
          </label>
          <input
            id="job-title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            required
            maxLength={150}
            placeholder="e.g. Junior Software Developer"
            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="company-name"
            className="block text-sm font-medium text-gray-200 mb-2"
          >
            Company name *
          </label>
          <input
            id="company-name"
            name="company"
            type="text"
            value={form.company}
            onChange={handleChange}
            required
            maxLength={150}
            placeholder="e.g. Savanna Technologies"
            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="job-description"
          className="block text-sm font-medium text-gray-200 mb-2"
        >
          Job description *
        </label>
        <textarea
          id="job-description"
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          maxLength={5000}
          rows={5}
          placeholder="Describe the role and its responsibilities..."
          className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="job-location"
          className="block text-sm font-medium text-gray-200 mb-2"
        >
          Location
        </label>
        <input
          id="job-location"
          name="location"
          type="text"
          value={form.location}
          onChange={handleChange}
          placeholder="e.g. Addis Ababa or Remote"
          className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="job-requirements"
          className="block text-sm font-medium text-gray-200 mb-2"
        >
          Requirements
        </label>
        <textarea
          id="job-requirements"
          name="requirements"
          value={form.requirements}
          onChange={handleChange}
          rows={4}
          placeholder={'Enter one requirement per line:\nJavaScript\nProblem solving\nCommunication'}
          className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-2">
          Enter each requirement on a separate line.
        </p>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-white mb-2">
          Workplace accommodations offered
        </legend>
        <p className="text-sm text-gray-400 mb-4">
          Select all accommodations available for this position.
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
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="text-sm text-red-400 bg-red-950/30 p-3 rounded-lg">
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
        className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition"
      >
        {loading ? 'Publishing...' : 'Publish job'}
      </button>
    </form>
  );
}
