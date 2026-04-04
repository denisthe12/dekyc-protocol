export function formatKzte(value: number, locale: 'ru' | 'en' = 'ru'): string {
  const safeValue = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeValue / 100);
}