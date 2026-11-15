import { useI18n } from '../../i18n/I18nContext';
import { ACCOMMODATIONS } from './accommodations';

export default function StepAccommodations({ formData, updateFormData }) {
  const { t, simpleWords } = useI18n();
  const selected = Array.isArray(formData.accommodationPreferences)
    ? formData.accommodationPreferences
    : [];

  const toggleAccommodation = (id) => {
    const updated = id === 'prefer_not_to_say'
      ? selected.includes(id) ? [] : [id]
      : selected.includes(id)
        ? selected.filter((item) => item !== id)
        : [...selected.filter((item) => item !== 'prefer_not_to_say'), id];

    updateFormData('accommodationPreferences', updated);
  };

  return (
    <fieldset>
      <legend className="sr-only">{t('wizard.accommodations.legend')}</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ACCOMMODATIONS.map(({ id, labelKey }) => (
          <label
            key={id}
            className="flex items-center gap-3 p-4 rounded-xl border bg-gray-950 border-gray-800 text-gray-300"
          >
            <input
              type="checkbox"
              checked={selected.includes(id)}
              onChange={() => toggleAccommodation(id)}
              className="accent-blue-600 h-4 w-4"
            />
            <span>{t(`wizard.accommodations.${simpleWords ? `${labelKey}Simple` : labelKey}`)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
