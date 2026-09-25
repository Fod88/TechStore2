const locale = import.meta.env.VITE_LOCALE || 'en-US';
const currency = import.meta.env.VITE_CURRENCY || 'USD';

const money = new Intl.NumberFormat(locale, { style: 'currency', currency });
const moneyWhole = new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 });
const number = new Intl.NumberFormat(locale);

export const formatCurrency = (value) => money.format(Number(value) || 0);
export const formatCurrencyWhole = (value) => moneyWhole.format(Number(value) || 0);
export const formatNumber = (value) => number.format(Number(value) || 0);

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(locale, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export const shortId = (id) => (id ? `#${String(id).slice(-8).toUpperCase()}` : '—');

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?';

export const pluralize = (count, singular, plural = `${singular}s`) => `${count} ${count === 1 ? singular : plural}`;
