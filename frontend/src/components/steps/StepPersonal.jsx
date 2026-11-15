import VoiceInput from '../wizard/VoiceInput';

const personalQuestions = {
  fullName: {
    id: 'fullName',
    label: 'Full name',
  },
  phoneOrEmail: {
    id: 'phoneOrEmail',
    label: 'Phone or email',
  },
};

export default function StepPersonal({
  field,
  formData,
  updateFormData,
  error,
  inputRef,
  onVoiceReviewStateChange
}) {
  const question = personalQuestions[field];

  return (
    <section>
      <VoiceInput
        {...question}
        type="text"
        required
        value={formData[field] || ''}
        error={error}
        inputRef={inputRef}
        onReviewStateChange={onVoiceReviewStateChange}
        onChange={(value) => updateFormData(field, value)}
      />
    </section>
  );
}
