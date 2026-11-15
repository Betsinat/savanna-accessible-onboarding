import VoiceInput from '../wizard/VoiceInput';
import { useI18n } from '../../i18n/I18nContext';

const IDENTITY_ROUTES = [
  'national_id',
  'refugee_id',
  'other_document',
  'partner_referral',
];

export default function StepIdentity({
  mode,
  formData,
  updateFormData,
  error,
  inputRef,
  onVoiceReviewStateChange
}) {
  const { t, simpleWords } = useI18n();
  const idRoute = formData.idRoute || '';

  return (
    <section>
      {mode === 'route' ? (
        <fieldset>
          <legend className="sr-only">{t('wizard.identity.legend')}</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {IDENTITY_ROUTES.map((route, index) => {
              const routeKey = `wizard.identity.${route}`;
              return (
                <label
                  key={route}
                  className={`flex items-start gap-3 p-4 rounded-xl border text-start transition-all ${
                    idRoute === route
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <input
                    ref={index === 0 ? inputRef : undefined}
                    type="radio"
                    name="idRoute"
                    value={route}
                    required
                    checked={idRoute === route}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'idRoute-error' : undefined}
                    onChange={() => updateFormData('idRoute', route)}
                    className="mt-1 h-4 w-4 accent-blue-600"
                  />
                  <span>
                    <span className="block font-semibold text-white">
                      {t(`${routeKey}.${simpleWords ? 'simpleLabel' : 'label'}`)}
                    </span>
                    <span className="mt-1 block text-xs text-gray-300">
                      {t(`${routeKey}.description`)}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          {error && (
            <p id="idRoute-error" className="mt-3 text-sm text-red-400">
              {error}
            </p>
          )}
        </fieldset>
      ) : idRoute !== 'partner_referral' ? (
        <VoiceInput
          id="idNumber"
          label={t(simpleWords ? 'wizard.fields.idNumberSimple' : 'wizard.fields.idNumber')}
          type="text"
          required
          placeholder=""
          value={formData.idDetails?.documentNumber || ''}
          error={error}
          inputRef={inputRef}
          onReviewStateChange={onVoiceReviewStateChange}
          onChange={(value) =>
            updateFormData('idDetails', { ...formData.idDetails, documentNumber: value })
          }
        />
      ) : (
        <p className="text-sm text-gray-300">{t('wizard.identity.partnerContinue')}</p>
      )}
    </section>
  );
}