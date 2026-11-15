import { useI18n } from '../../i18n/I18nContext';
import { getAccommodationLabelKey } from './accommodations';

export default function StepReview({ formData }) {
  const { t, simpleWords } = useI18n();
  const accommodations = Array.isArray(formData.accommodationPreferences)
    ? formData.accommodationPreferences
    : [];

  return (
    <section
      aria-label={t('wizard.review.label')}
      className="bg-gray-950 border border-gray-800 rounded-xl p-4 space-y-3 text-sm"
    >
      <div className="flex justify-between border-b border-gray-800 pb-2">
        <span className="text-gray-400">{t('wizard.review.name')}</span>
        <span className="font-semibold text-white">{formData.fullName || t('wizard.review.notProvided')}</span>
      </div>

      <div className="flex justify-between border-b border-gray-800 pb-2">
        <span className="text-gray-400">{t('wizard.review.contact')}</span>
        <span className="font-semibold text-white">{formData.phoneOrEmail || t('wizard.review.notProvided')}</span>
      </div>

      <div className="flex justify-between border-b border-gray-800 pb-2">
        <span className="text-gray-400">{t('wizard.review.identity')}</span>
        <span className="font-semibold text-white capitalize">
          {formData.idRoute ? t(`wizard.identity.${formData.idRoute}.label`) : t('wizard.review.notProvided')}
        </span>
      </div>

      <div className="flex justify-between border-b border-gray-800 pb-2">
        <span className="text-gray-400">{t('wizard.review.support')}</span>
        <span className="font-semibold text-white capitalize">
          {formData.supportType ? t(`wizard.support.values.${formData.supportType}`) : t('wizard.review.notProvided')}
        </span>
      </div>

      <div className="flex justify-between border-b border-gray-800 pb-2">
        <span className="text-gray-400">{t('wizard.review.accommodations')}</span>
        <span className="font-semibold text-white">
          {accommodations.length > 0
            ? accommodations.map((id) => {
                const accommodationLabelKey = getAccommodationLabelKey(id);
                if (!accommodationLabelKey) return id;
                const labelKey = simpleWords
                  ? `${accommodationLabelKey}Simple`
                  : accommodationLabelKey;
                return t(`wizard.accommodations.${labelKey}`);
              }).join(', ')
            : t('wizard.review.noneSelected')}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-gray-400">{t('wizard.review.consent')}</span>
        <span className="font-semibold text-white">
          {formData.consentGiven ? t('wizard.review.provided') : t('wizard.review.notGiven')}
        </span>
      </div>
    </section>
  );
}
