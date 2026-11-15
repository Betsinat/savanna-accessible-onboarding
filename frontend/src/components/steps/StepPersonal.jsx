import VoiceInput from '../wizard/VoiceInput';
import { useI18n } from '../../i18n/I18nContext';

const personalQuestions = {
  fullName: {
    id: 'fullName',
    labelKey: 'wizard.fields.fullName',
    simpleLabelKey: 'wizard.fields.fullNameSimple',
  },
  phoneOrEmail: {
    id: 'phoneOrEmail',
    labelKey: 'wizard.fields.contact',
    simpleLabelKey: 'wizard.fields.contactSimple',
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
  const { t, simpleWords } = useI18n();
  const question = personalQuestions[field];

  return (
    <section>
      <VoiceInput
        id={question.id}
        label={t(simpleWords ? question.simpleLabelKey : question.labelKey)}
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
