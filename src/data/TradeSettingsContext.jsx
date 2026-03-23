import { createContext, useContext, useState, useEffect } from 'react';

const PLATFORMS = [
  { value: 'pc', label: 'PoE 1 PC' },
  { value: 'xbox', label: 'PoE 1 Xbox' },
  { value: 'sony', label: 'PoE 1 Sony' },
];

// Fallback leagues if API fetch fails
const FALLBACK_LEAGUES = [
  { value: 'Mirage', label: 'Mirage' },
  { value: 'Hardcore+Mirage', label: 'Hardcore Mirage' },
  { value: 'Standard', label: 'Standard' },
  { value: 'Hardcore', label: 'Hardcore' },
];

const STATUS_OPTIONS = [
  { value: 'buyout', label: 'Instant Buyout and In Person' },
  { value: 'buyout_only', label: 'Instant Buyout' },
  { value: 'onlineleague', label: 'In Person (Online in League)' },
  { value: 'online', label: 'In Person (Online)' },
  { value: 'any', label: 'Any' },
];

const TradeSettingsContext = createContext();

export function TradeSettingsProvider({ children }) {
  const [leagues, setLeagues] = useState(FALLBACK_LEAGUES);
  const [settings, setSettings] = useState({
    platform: 'pc',
    league: FALLBACK_LEAGUES[0].value,
    status: 'buyout',
  });

  // Fetch live leagues from PoE trade API (runs in user's browser)
  useEffect(() => {
    async function fetchLeagues() {
      try {
        const res = await fetch(
          'https://www.pathofexile.com/api/trade/data/leagues',
          { headers: { Accept: 'application/json' } }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (data?.result && Array.isArray(data.result) && data.result.length > 0) {
          const fetched = data.result.map((l) => ({
            value: l.id,
            label: l.text || l.id,
          }));
          setLeagues(fetched);

          // Set default to the first league (current challenge league)
          setSettings((prev) => ({
            ...prev,
            league: fetched[0].value,
          }));
        }
      } catch {
        // Silently fall back to hardcoded leagues
      }
    }

    fetchLeagues();
  }, []);

  function updateSetting(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <TradeSettingsContext.Provider value={{ settings, updateSetting, leagues }}>
      {children}
    </TradeSettingsContext.Provider>
  );
}

export function useTradeSettings() {
  return useContext(TradeSettingsContext);
}

export { PLATFORMS, STATUS_OPTIONS };
