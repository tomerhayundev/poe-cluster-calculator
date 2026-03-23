import { buildTemplateTradeUrl } from '../../data/calculator';
import { useTradeSettings } from '../../data/TradeSettingsContext';

const TEMPLATES = [
  { min: 2, max: 3, label: 'Any Small (2-3 Passives)', desc: 'Small cluster jewels', icon: '◇' },
  { min: 4, max: 5, label: 'Any Medium (4-5 Passives)', desc: 'Medium cluster jewels', icon: '◆' },
  { min: 8, max: 8, label: 'Any Large (8 Passives)', desc: 'Large 8-passive cluster jewels', icon: '⬡' },
  { min: 12, max: 12, label: 'Any Large (12 Passives)', desc: 'Large 12-passive cluster jewels', icon: '⬡' },
  { min: 12, max: 12, ilvlMin: 84, label: 'iLvl 84+ Large 12 Passive', desc: 'Max tier notables', icon: '⚡' },
];

export default function TradeTemplatesPage() {
  const { settings } = useTradeSettings();

  return (
    <div className="page">
      {/* Hero Section — same style as calculator */}
      <div className="hero-row" style={{ gridTemplateColumns: '1fr' }}>
        <div className="hero-main">
          <div className="hero-label">Quick Search</div>
          <h1 className="hero-title">Trade Templates</h1>
          <p className="hero-desc">
            Pre-built trade searches for cluster jewels on the official
            Path of Exile trade site, filtered by type and size.
          </p>
        </div>
      </div>

      {/* Templates Section */}
      <div className="section">
        <div className="section-header">
          <span className="section-icon">◆</span>
          <h3 className="section-title">Cluster Jewel Searches</h3>
        </div>
        <div className="template-list">
          {TEMPLATES.map((t) => {
            const url = buildTemplateTradeUrl(t.min, t.max, t.ilvlMin, settings);
            return (
              <a
                key={t.label}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="trade-link"
              >
                <span className="trade-link__template-icon">{t.icon}</span>
                <span className="trade-link__content">
                  <strong>{t.label}</strong>
                  <small>{t.desc}</small>
                </span>
                <span className="trade-link__arrow">↗</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
