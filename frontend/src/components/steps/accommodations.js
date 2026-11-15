export const ACCOMMODATIONS = [
  { id: 'captions', labelKey: 'captions' },
  { id: 'sign_language', labelKey: 'signLanguage' },
  { id: 'screen_reader_support', labelKey: 'screenReader' },
  { id: 'large_text', labelKey: 'largeText' },
  { id: 'interpreter_language', labelKey: 'interpreter' },
  { id: 'more_time', labelKey: 'moreTime' },
  { id: 'screen_reader_compatible', labelKey: 'screenReaderCompatible' },
  { id: 'flexible_hours', labelKey: 'flexibleHours' },
  { id: 'remote_work', labelKey: 'remoteWork' },
  { id: 'captioned_meetings', labelKey: 'captionedMeetings' },
  { id: 'prefer_not_to_say', labelKey: 'preferNotToSay' },
];

export function getAccommodationLabelKey(id) {
  return ACCOMMODATIONS.find((item) => item.id === id)?.labelKey;
}
