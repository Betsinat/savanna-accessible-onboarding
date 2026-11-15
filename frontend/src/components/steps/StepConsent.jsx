import { useI18n } from '../../i18n/I18nContext';

export default function StepConsent({ formData, updateFormData, error, inputRef }) {
  const { t, simpleWords } = useI18n();
  return (
    <div>
      <div className="flex items-start gap-3 bg-gray-950 border border-gray-800 p-4 rounded-xl">
        <input
          ref={inputRef}
          type="checkbox"
          id="consentGiven"
          required
          checked={Boolean(formData.consentGiven)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'consentGiven-error' : undefined}
          onChange={(event) => updateFormData('consentGiven', event.target.checked)}
          className="mt-1 accent-blue-600 h-4 w-4 cursor-pointer"
        />
        <label htmlFor="consentGiven" className="text-sm text-gray-300 cursor-pointer">
          {t(simpleWords ? 'wizard.consentSimple' : 'wizard.consentLabel')}
          <span aria-hidden="true"> {t('common.required')}</span>
        </label>
      </div>
      {error && (
        <p id="consentGiven-error" className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
