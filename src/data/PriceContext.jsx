import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchPrices, clearPriceCache } from './priceService';
import { useTradeSettings } from './TradeSettingsContext';

const PriceContext = createContext();

export function PriceProvider({ children }) {
  const { settings } = useTradeSettings();
  const [priceMap, setPriceMap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPrices = useCallback(async () => {
    if (!settings.league) return;
    setLoading(true);
    setError(null);
    try {
      const map = await fetchPrices(settings.league);
      setPriceMap(map);
      if (!map) setError('Could not load prices');
    } catch (err) {
      setError(err.message);
      setPriceMap(null);
    }
    setLoading(false);
  }, [settings.league]);

  useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  return (
    <PriceContext.Provider value={{ priceMap, loading, error, refresh: loadPrices }}>
      {children}
    </PriceContext.Provider>
  );
}

export function usePrices() {
  return useContext(PriceContext);
}
