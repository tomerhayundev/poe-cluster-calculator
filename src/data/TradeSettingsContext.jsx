import { createContext, useContext, useState } from 'react';

const PLATFORMS = [
  { value: 'pc', label: 'PoE 1 PC' },
  { value: 'xbox', label: 'PoE 1 Xbox' },
  { value: 'sony', label: 'PoE 1 Sony' },
];

const LEAGUES = [
  { value: 'Mirage', label: 'Mirage' },
  { value: 'Hardcore+Mirage', label: 'Hardcore Mirage' },
  { value: 'Ruthless+Mirage', label: 'Ruthless Mirage' },
  { value: 'HC+Ruthless+Mirage', label: 'HC Ruthless Mirage' },
  { value: 'Standard', label: 'Standard' },
  { value: 'Hardcore', label: 'Hardcore' },
  { value: 'Ruthless', label: 'Ruthless' },
  { value: 'Hardcore+Ruthless', label: 'Hardcore Ruthless' },
];

const STATUS_OPTIONS = [
  { value: 'buyout', label: 'Instant Buyout' },
  { value: 'onlineleague', label: 'In Person (Online in League)' },
  { value: 'online', label: 'In Person (Online)' },
  { value: 'any', label: 'Any' },
];

const DEFAULTS = {
  platform: 'pc',
  league: 'Mirage',
  status: 'buyout',
};

const TradeSettingsContext = createContext();

export function TradeSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);

  function updateSetting(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <TradeSettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </TradeSettingsContext.Provider>
  );
}

export function useTradeSettings() {
  return useContext(TradeSettingsContext);
}

export { PLATFORMS, LEAGUES, STATUS_OPTIONS };
