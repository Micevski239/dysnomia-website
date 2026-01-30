import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Currency = 'EUR' | 'MKD';

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceInMKD: number) => string;
  convertPrice: (priceInMKD: number) => number;
  currencySymbol: string;
}

const CURRENCY_STORAGE_KEY = 'dysnomia_currency';
const DEFAULT_CURRENCY: Currency = 'MKD';

// Static exchange rate (1 EUR = ~61.5 MKD)
const MKD_TO_EUR_RATE = 61.5;

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window === 'undefined') return DEFAULT_CURRENCY;
    try {
      const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (stored === 'EUR' || stored === 'MKD') return stored;
      return DEFAULT_CURRENCY;
    } catch {
      return DEFAULT_CURRENCY;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    } catch (error) {
      console.error('Failed to save currency to localStorage:', error);
    }
  }, [currency]);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  const convertPrice = (priceInMKD: number): number => {
    if (currency === 'MKD') {
      return priceInMKD;
    }
    // Convert to EUR
    return Math.round((priceInMKD / MKD_TO_EUR_RATE) * 100) / 100;
  };

  const formatPrice = (priceInMKD: number): string => {
    const convertedPrice = convertPrice(priceInMKD);

    if (currency === 'MKD') {
      return `${convertedPrice.toLocaleString()} MKD`;
    }

    return `€${convertedPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const currencySymbol = currency === 'EUR' ? '€' : 'MKD';

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        convertPrice,
        currencySymbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrencyContext() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrencyContext must be used within a CurrencyProvider');
  }
  return context;
}
