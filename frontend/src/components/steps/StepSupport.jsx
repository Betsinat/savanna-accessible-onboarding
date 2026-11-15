import VoiceInput from '../wizard/VoiceInput';
import { useI18n } from '../../i18n/I18nContext';

export default function StepSupport({
  field,
  formData,
  updateFormData,
  error,
  inputRef,
  onVoiceReviewStateChange
}) {
  const { t, simpleWords } = useI18n();
  const supportType = formData.supportType || '';
  const preferredContactMethod = formData.preferredContactMethod || '';

  if (field === 'supportType') {
    return (
      <fieldset>
        <legend className="sr-only">{t('wizard.support.legend')}</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { id: 'screen_reader_assistance', label: t('wizard.support.screenReader'), simpleLabel: t('wizard.support.screenReaderSimple'), desc: t('wizard.support.screenReaderDescription') },
            { id: 'alternative_communication', label: t('wizard.support.communication'), simpleLabel: t('wizard.support.communicationSimple'), desc: t('wizard.support.communicationDescription') },
            { id: 'interview_accommodation', label: t('wizard.support.interview'), simpleLabel: t('wizard.support.interviewSimple'), desc: t('wizard.support.interviewDescription') },
            { id: 'general_guidance', label: t('wizard.support.guidance'), simpleLabel: t('wizard.support.guidanceSimple'), desc: t('wizard.support.guidanceDescription') },
          ].map((type) => (
            <label
              key={type.id}
              className={`flex items-start gap-3 p-4 rounded-xl border text-start transition-all ${
                supportType === type.id
                  ? 'bg-blue-600/20 border-blue-500 text-white'
                  : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <input
                ref={type.id === 'screen_reader_assistance' ? inputRef : undefined}
                type="radio"
                name="supportType"
                value={type.id}
                required
                checked={supportType === type.id}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'supportType-error' : undefined}
                onChange={() => updateFormData('supportType', type.id)}
                className="mt-1 h-4 w-4 accent-blue-600"
              />
              <span>
                <span className="block font-semibold text-white">
                  {simpleWords ? type.simpleLabel : type.label}
                </span>
                <span className="mt-1 block text-xs text-gray-300">{type.desc}</span>
              </span>
            </label>
          ))}
        </div>
        {error && (
          <p id="supportType-error" className="mt-3 text-sm text-red-400">
            {error}
          </p>
        )}
      </fieldset>
    );
  }

  if (field === 'preferredContactMethod') {
    return (
      <fieldset>
        <legend className="mb-3 text-sm font-medium">{t('wizard.support.contactMethod')}</legend>
        <div className="flex gap-4">
          {['phone', 'sms', 'email'].map((method) => (
            <label key={method} className="flex items-center gap-2 cursor-pointer bg-gray-950 border border-gray-800 px-4 py-3 rounded-xl flex-1 justify-center">
              <input
                type="radio"
                name="preferredContactMethod"
                value={method}
                checked={preferredContactMethod === method}
                required={method === 'phone'}
                ref={method === 'phone' ? inputRef : undefined}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'preferredContactMethod-error' : undefined}
                onChange={(event) => updateFormData('preferredContactMethod', event.target.value)}
                className="accent-blue-600"
              />
              <span className="font-medium text-white">{t(`wizard.support.${method}`)}</span>
            </label>
          ))}
        </div>
        {error && (
          <p id="preferredContactMethod-error" className="mt-3 text-sm text-red-400">
            {error}
          </p>
        )}
      </fieldset>
    );
  }

  return (
    <section>
      <VoiceInput
        id="additionalNotes"
        label={t(simpleWords ? 'wizard.fields.notesSimple' : 'wizard.fields.notes')}
        type="textarea"
        value={formData.additionalNotes || ''}
        error={error}
        inputRef={inputRef}
        onReviewStateChange={onVoiceReviewStateChange}
        onChange={(value) => updateFormData('additionalNotes', value)}
      />
    </section>
  );
}
