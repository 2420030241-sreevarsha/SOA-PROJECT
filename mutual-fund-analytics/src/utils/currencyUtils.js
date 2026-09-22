// Country and Currency Definitions and Formatting Helpers

export const SUPPORTED_CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR - ₹)', locale: 'en-IN' },
  { code: 'USD', symbol: '$', name: 'US Dollar (USD - $)', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR - €)', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP - £)', locale: 'en-GB' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (JPY - ¥)', locale: 'ja-JP' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar (CAD - C$)', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (AUD - A$)', locale: 'en-AU' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (SGD - S$)', locale: 'en-SG' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)', locale: 'en-AE' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc (CHF)', locale: 'de-CH' }
];

export const SUPPORTED_COUNTRIES = [
  { code: 'IN', name: 'India', defaultCurrency: 'INR' },
  { code: 'US', name: 'United States', defaultCurrency: 'USD' },
  { code: 'GB', name: 'United Kingdom', defaultCurrency: 'GBP' },
  { code: 'AE', name: 'United Arab Emirates', defaultCurrency: 'AED' },
  { code: 'SG', name: 'Singapore', defaultCurrency: 'SGD' },
  { code: 'CA', name: 'Canada', defaultCurrency: 'CAD' },
  { code: 'AU', name: 'Australia', defaultCurrency: 'AUD' },
  { code: 'DE', name: 'Germany', defaultCurrency: 'EUR' },
  { code: 'FR', name: 'France', defaultCurrency: 'EUR' },
  { code: 'JP', name: 'Japan', defaultCurrency: 'JPY' },
  { code: 'CH', name: 'Switzerland', defaultCurrency: 'CHF' },
  { code: 'NZ', name: 'New Zealand', defaultCurrency: 'USD' },
  { code: 'SA', name: 'Saudi Arabia', defaultCurrency: 'USD' },
  { code: 'OTHER', name: 'Other International', defaultCurrency: 'USD' }
];

export function getCurrencyMeta(currencyCode = 'INR') {
  const found = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
  return found || SUPPORTED_CURRENCIES[0];
}

export function formatCurrency(amount, currencyCode = 'INR', currencySymbol = '₹') {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currencySymbol}0`;
  }
  const num = Number(amount);
  const meta = getCurrencyMeta(currencyCode);
  const locale = meta.locale || 'en-IN';
  
  const absFormatted = Math.abs(num).toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  const sign = num < 0 ? '-' : '';
  return `${sign}${currencySymbol}${absFormatted}`;
}

export function formatCurrencyWithSign(amount, currencyCode = 'INR', currencySymbol = '₹') {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currencySymbol}0`;
  }
  const num = Number(amount);
  const meta = getCurrencyMeta(currencyCode);
  const locale = meta.locale || 'en-IN';
  
  const absFormatted = Math.abs(num).toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  const sign = num > 0 ? '+' : num < 0 ? '-' : '';
  return `${sign}${currencySymbol}${absFormatted}`;
}
