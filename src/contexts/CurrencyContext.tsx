import React, { createContext, useContext, useState, useEffect } from 'react';

interface CurrencyContextType {
  userCurrency: string;
  setUserCurrency: (currency: string) => void;
  convertPrice: (price: number, fromCurrency: string) => number;
  formatPrice: (price: number, currency?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Map of country codes to their default currencies
const COUNTRY_CURRENCIES: Record<string, string> = {
  IN: 'INR',
  US: 'USD',
  NL: 'EUR',
  DE: 'EUR',
  FR: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  // Add more countries as needed
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userCurrency, setUserCurrency] = useState<string>('INR');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

  useEffect(() => {
    // Detect user's country and set initial currency
    const detectUserCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code;
        const defaultCurrency = COUNTRY_CURRENCIES[countryCode] || 'USD';
        setUserCurrency(defaultCurrency);
      } catch (error) {
        console.error('Error detecting country:', error);
        setUserCurrency('USD'); // Fallback to USD
      }
    };

    detectUserCountry();
  }, []);

  useEffect(() => {
    // Fetch exchange rates from a free API
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        setExchangeRates(data.rates);
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
        // Fallback rates in case API fails
        setExchangeRates({
          USD: 1,
          INR: 83,
          EUR: 0.92,
          GBP: 0.79,
        });
      }
    };

    fetchExchangeRates();
    // Refresh rates every hour
    const interval = setInterval(fetchExchangeRates, 3600000);
    return () => clearInterval(interval);
  }, []);

  const convertPrice = (price: number, fromCurrency: string): number => {
    if (fromCurrency === userCurrency) return price;
    
    // Convert to USD first if not already USD
    const priceInUSD = fromCurrency === 'USD' 
      ? price 
      : price / (exchangeRates[fromCurrency] || 1);
    
    // Convert from USD to target currency
    return priceInUSD * (exchangeRates[userCurrency] || 1);
  };

  const formatPrice = (price: number, currency?: string): string => {
    const targetCurrency = currency || userCurrency;
    const locale = targetCurrency === 'EUR' ? 'de-DE' : 
                  targetCurrency === 'INR' ? 'en-IN' : 
                  'en-US';
    
    return price.toLocaleString(locale, {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <CurrencyContext.Provider value={{
      userCurrency,
      setUserCurrency,
      convertPrice,
      formatPrice,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}; 