import {
  useTradeSettings,
  PLATFORMS,
  LEAGUES,
  STATUS_OPTIONS,
} from '../../data/TradeSettingsContext';

export default function TradeSettings() {
  const { settings, updateSetting } = useTradeSettings();

  return (
    <div className="trade-settings">
      <div className="trade-settings__header">
        <span className="trade-settings__icon">⚙</span>
        <span className="trade-settings__title">Trade Settings</span>
      </div>
      <div className="trade-settings__controls">
        <label className="trade-setting">
          <span className="trade-setting__label">Platform</span>
          <select
            className="trade-setting__select"
            value={settings.platform}
            onChange={(e) => updateSetting('platform', e.target.value)}
          >
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </label>

        <label className="trade-setting">
          <span className="trade-setting__label">League</span>
          <select
            className="trade-setting__select"
            value={settings.league}
            onChange={(e) => updateSetting('league', e.target.value)}
          >
            {LEAGUES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </label>

        <label className="trade-setting">
          <span className="trade-setting__label">Listing Type</span>
          <select
            className="trade-setting__select"
            value={settings.status}
            onChange={(e) => updateSetting('status', e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
