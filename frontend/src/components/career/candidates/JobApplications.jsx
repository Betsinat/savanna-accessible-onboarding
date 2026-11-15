
import React, { useState } from 'react';
import VoiceInput from '../../wizard/VoiceInput';
import { submitJobApplication } from '../../../services/careerService';

const APPLICATION_QUESTIONS = [
  {
    id: 'motivation',
    label: 'Why are you interested in this position?',
    placeholder: 'Tell the employer what interests you about this opportunity...'
  },
  {
    id: 'experience',
    label: 'What skills or experience make you a good fit?',
    placeholder: 'Describe your relevant skills, education, or experience...'
  },
  {
    id: 'strengths',
    label: 'What strengths would you bring to this role?',
    placeholder: 'Share the qualities and abilities you would bring...'
  },
  {
    id: 'problem_solving',
    label: 'Tell us about a challenge you have faced and how you handled it.',
    placeholder: 'Describe the challenge and the steps you took...'
  }
];

export default function JobApplications({
  job,
  sessionId,
  candidateName,
  requestedAccommodations = [],
  onCancel,
  onSubmitted
}) {
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isEditingAnswer, setIsEditingAnswer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const question = APPLICATION_QUESTIONS[currentQuestion];
  const currentAnswer = answers[question.id] || '';

  const updateAnswer = (questionId, value) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: value
    }));
    setError('');
  };

  const handleNext = () => {
    if (!currentAnswer.trim()) {
      setError('Please answer this question before continuing.');
      return;
    }

    setError('');

    if (isEditingAnswer) {
      setIsEditingAnswer(false);
      setIsReviewing(true);
      return;
    }

    if (currentQuestion < APPLICATION_QUESTIONS.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
    } else {
      setIsReviewing(true);
    }
  };

  const handleBack = () => {
    setError('');

    if (isEditingAnswer) {
      setIsEditingAnswer(false);
      setIsReviewing(true);
      return;
    }

    if (isReviewing) {
      setIsReviewing(false);
      return;
    }

    if (currentQuestion > 0) {
      setCurrentQuestion((previous) => previous - 1);
    } else {
      onCancel?.();
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!sessionId || !job?._id || !candidateName?.trim()) {
      setError('Your candidate information is incomplete. Please check your registration and try again.');
      return;
    }

    const unanswered = APPLICATION_QUESTIONS.find(
      (item) => !answers[item.id]?.trim()
    );

    if (unanswered) {
      setError(`Please answer: ${unanswered.label}`);
      setIsReviewing(false);
      setIsEditingAnswer(false);
      setCurrentQuestion(
        APPLICATION_QUESTIONS.findIndex((item) => item.id === unanswered.id)
      );
      return;
    }

    const voiceAnswers = APPLICATION_QUESTIONS.map((item) => ({
      questionId: item.id,
      audioTranscript: answers[item.id].trim()
    }));

    const payload = {
      sessionId,
      jobId: job._id,
      candidateName: candidateName.trim(),
      voiceAnswers,
      requestedAccommodations
    };

    try {
      setIsSubmitting(true);
      setError('');

      const result = await submitJobApplication(payload);
      onSubmitted?.(result);
    } catch (submitError) {
      setError(
        submitError.response?.data?.message ||
        submitError.message ||
        'We could not submit your application. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="max-w-3xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8"
      aria-labelledby="application-heading"
    >
      <header className="mb-8">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-blue-300 hover:text-blue-200 mb-5"
        >
          ← Back to job details
        </button>

        <p className="text-sm font-semibold text-blue-400">
          JOB APPLICATION
        </p>

        <h2
          id="application-heading"
          className="text-2xl font-bold text-white mt-2"
        >
          {job.title}
        </h2>

        <p className="text-gray-400 mt-1">{job.company}</p>
      </header>

      {!isReviewing ? (
        <>
          <div className="mb-7">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>
                Question {currentQuestion + 1} of {APPLICATION_QUESTIONS.length}
              </span>
              <span>
                {Math.round(
                  ((currentQuestion + 1) / APPLICATION_QUESTIONS.length) * 100
                )}%
              </span>
            </div>

            <div
              className="w-full h-2 bg-gray-800 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={currentQuestion + 1}
              aria-valuemin={1}
              aria-valuemax={APPLICATION_QUESTIONS.length}
              aria-label="Application progress"
            >
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{
                  width: `${((currentQuestion + 1) / APPLICATION_QUESTIONS.length) * 100}%`
                }}
              />
            </div>
          </div>

          <VoiceInput
            id={`application-${question.id}`}
            label={question.label}
            placeholder={question.placeholder}
            type="textarea"
            value={currentAnswer}
            onChange={(value) => updateAnswer(question.id, value)}
            required
            error={error}
          />

          <div className="flex flex-wrap justify-between gap-3 mt-8">
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white"
            >
              {isEditingAnswer
                ? 'Back to review'
                : currentQuestion === 0
                  ? 'Cancel'
                  : 'Previous'}
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white"
            >
              {isEditingAnswer
                ? 'Save answer'
                : currentQuestion === APPLICATION_QUESTIONS.length - 1
                  ? 'Review answers'
                  : 'Next question'}
            </button>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-xl font-bold text-white mb-2">
            Review your answers
          </h3>

          <p className="text-sm text-gray-400 mb-6">
            Check your answers before submitting. You can edit any answer.
          </p>

          <div className="space-y-5">
            {APPLICATION_QUESTIONS.map((item, index) => (
              <article
                key={item.id}
                className="p-5 bg-gray-950 border border-gray-800 rounded-xl"
              >
                <div className="flex justify-between items-start gap-3">
                  <h4 className="font-semibold text-white">
                    {index + 1}. {item.label}
                  </h4>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentQuestion(index);
                      setIsEditingAnswer(true);
                      setIsReviewing(false);
                      setError('');
                    }}
                    className="text-sm text-blue-300 hover:text-blue-200 shrink-0"
                  >
                    Edit
                  </button>
                </div>

                <p className="text-sm text-gray-300 mt-3 whitespace-pre-wrap">
                  {answers[item.id]}
                </p>
              </article>
            ))}
          </div>

          {error && (
            <p className="text-sm text-red-400 mt-5" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-wrap justify-between gap-3 mt-8">
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-5 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-50"
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit application'}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
