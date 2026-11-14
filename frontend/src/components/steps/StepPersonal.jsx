import VoiceInput from '../wizard/VoiceInput';

const personalQuestions = {
  fullName: {
    id: 'fullName',
    label: 'Full name',
    placeholder: 'Enter your full name',
  },
  phoneOrEmail: {
    id: 'phoneOrEmail',
    label: 'Phone number or email',
    placeholder: 'Enter your phone number or email',
  },
};

export default function StepPersonal({ field, formData, updateFormData, error, inputRef }) {
  const question = personalQuestions[field];

  return (
    <section>
      <VoiceInput
        {...question}
        type="text"
        value={formData[field] || ''}
        error={error}
        inputRef={inputRef}
        onChange={(value) => updateFormData(field, value)}
      />
    </section>
  );
}
