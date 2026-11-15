export function formatEthiopianDate(date, lang) {
  const locale = lang === 'am' || lang === 'ti'
    ? `${lang}-ET-u-ca-ethiopic`
    : `${lang}-ET`;

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function normalizeEthiopianPhone(input) {
  if (typeof input !== 'string') return null;

  const phone = input.trim().replace(/[\s().-]/g, '');
  if (/^0[79]\d{8}$/.test(phone)) {
    return `+251${phone.slice(1)}`;
  }
  if (/^\+251[79]\d{8}$/.test(phone)) {
    return phone;
  }
  return null;
}
