import { buildTemplateTradeUrl } from '../../data/calculator';

const TEMPLATES = [
  { min: 2, max: 3, label: 'Any Small (2-3 Passives)', desc: 'Small cluster jewels' },
  { min: 4, max: 5, label: 'Any Medium (4-5 Passives)', desc: 'Medium cluster jewels' },
  { min: 8, max: 8, label: 'Any Large (8 Passives)', desc: 'Large 8-passive cluster jewels' },
  { min: 12, max: 12, label: 'Any Large (12 Passives)', desc: 'Large 12-passive cluster jewels' },
  { min: 12, max: 12, ilvlMin: 84, label: 'iLvl 84+ Large 12 Passive', desc: 'Max tier notables' },
];

export default function TradeTemplatesPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Trade Templates</h2>
        <p className="page-description">
          Quick links to search for cluster jewels on the official Path of Exile
          trade site, pre-filtered by type.
        </p>
      </div>

      <div className="trade-templates-grid">
        {TEMPLATES.map((t) => {
          const url = buildTemplateTradeUrl(t.min, t.max, t.ilvlMin);
          return (
            <a
              key={t.label}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="template-card"
            >
              <div className="template-card__icon">💎</div>
              <div className="template-card__content">
                <h3 className="template-card__title">{t.label}</h3>
                <p className="template-card__desc">{t.desc}</p>
              </div>
              <span className="template-card__arrow">↗</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
