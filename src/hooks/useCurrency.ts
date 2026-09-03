import { useCurrencyContext, type Currency } from '../context/CurrencyContext';

export function useCurrency() {
  const { currency, setCurrency, formatPrice, convertPrice, currencySymbol } = useCurrencyContext();

  const toggleCurrency = () => {
    setCurrency(currency === 'EUR' ? 'MKD' : 'EUR');
  };

  return {
    currency,
    setCurrency,
    toggleCurrency,
    formatPrice,
    convertPrice,
    currencySymbol,
    isEUR: currency === 'EUR',
    isMKD: currency === 'MKD',
  };
}

export type { Currency };
