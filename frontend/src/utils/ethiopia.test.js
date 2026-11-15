import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatEthiopianDate, normalizeEthiopianPhone } from './ethiopia.js';

describe('normalizeEthiopianPhone', () => {
  it('normalizes Ethiopian mobile numbers with 09 and 07 prefixes', () => {
    assert.equal(normalizeEthiopianPhone('0912345678'), '+251912345678');
    assert.equal(normalizeEthiopianPhone('07 1234 5678'), '+251712345678');
  });

  it('accepts canonical international numbers and rejects invalid numbers', () => {
    assert.equal(normalizeEthiopianPhone('+251912345678'), '+251912345678');
    assert.equal(normalizeEthiopianPhone('+251812345678'), null);
    assert.equal(normalizeEthiopianPhone('091234567'), null);
    assert.equal(normalizeEthiopianPhone(null), null);
  });
});

describe('formatEthiopianDate', () => {
  it('formats an Amharic date with the Ethiopic calendar', () => {
    assert.equal(
      formatEthiopianDate(new Date('2024-01-01T00:00:00Z'), 'am'),
      new Intl.DateTimeFormat('am-ET-u-ca-ethiopic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date('2024-01-01T00:00:00Z'))
    );
  });
});
