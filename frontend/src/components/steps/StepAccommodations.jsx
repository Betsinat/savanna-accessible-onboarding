const ACCOMMODATIONS = [
  { id: 'screen_reader_compatible', label: 'Screen Reader Compatible' },
  { id: 'flexible_hours', label: 'Flexible Working Hours' },
  { id: 'remote_work', label: 'Remote Work Enabled' },
  { id: 'captioned_meetings', label: 'Captioned Meetings' },
];

export default function StepAccommodations({ formData, updateFormData }) {
  const selected = Array.isArray(formData.accommodationPreferences)
    ? formData.accommodationPreferences
    : [];

  const toggleAccommodation = (id) => {
    const updated = selected.includes(id)
      ? selected.filter((item) => item !== id)
      : [...selected, id];

    updateFormData('accommodationPreferences', updated);
  };

  return (
    <fieldset>
      <legend className="sr-only">Available accommodations</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ACCOMMODATIONS.map(({ id, label }) => (
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
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
