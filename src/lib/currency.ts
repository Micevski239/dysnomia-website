import type { Currency } from '../context/CurrencyContext';

// Static exchange rate (1 EUR = ~61.5 MKD)
const MKD_TO_EUR_RATE = 61.5;

export function convertMKDToEUR(priceInMKD: number): number {
  return Math.round((priceInMKD / MKD_TO_EUR_RATE) * 100) / 100;
}

export function convertEURToMKD(priceInEUR: number): number {
  return Math.round(priceInEUR * MKD_TO_EUR_RATE);
}

export function formatPriceInCurrency(priceInMKD: number, currency: Currency): string {
  if (currency === 'MKD') {
    return `${priceInMKD.toLocaleString()} MKD`;
  }
  const eurPrice = convertMKDToEUR(priceInMKD);
  return `€${eurPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getCurrencySymbol(currency: Currency): string {
  return currency === 'EUR' ? '€' : 'MKD';
}
