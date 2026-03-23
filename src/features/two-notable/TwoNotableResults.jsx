import { useState } from 'react';
import {
  buildTradeUrl3n2d,
  buildMasterTradeUrl,
  getEnchantKey,
  enchantMap,
  includesEnchant,
} from '../../data/calculator';
import { useTradeSettings } from '../../data/TradeSettingsContext';
import { usePrices } from '../../data/PriceContext';
import { getPriceForCombination, formatPrice } from '../../data/priceService';
import NotableTooltip from '../../components/ui/NotableTooltip';

export default function TwoNotableResults({ data, passiveCount = 8 }) {
  const [activeTab, setActiveTab] = useState(0);

  if (data.error && data.results.length === 0) {
    return <div className="result-error">{data.error}</div>;
  }

  const successes = data.results.filter((r) => r.success);
  const failures = data.results.filter((r) => !r.success);

  if (successes.length === 0) {
    return (
      <div>
        <div className="result-error">{data.error}</div>
        <ul className="error-list">
          {failures.map((f) => (
            <li key={f.name} className="error-list__item">
              <strong>{f.notableName1}</strong> + <strong>{f.notableName3}</strong>:{' '}
              {f.error}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const current = successes[activeTab] || successes[0];

  return (
    <div className="two-notable-results">
      {/* Tab bar */}
      {successes.length > 1 && (
        <div className="result-tabs">
          {successes.map((s, idx) => (
            <button
              key={s.name}
              className={`result-tab ${idx === activeTab ? 'result-tab--active' : ''}`}
              onClick={() => setActiveTab(idx)}
            >
              {s.notableName1} + {s.notableName3}
            </button>
          ))}
        </div>
      )}

      {/* Active result */}
      <ResultDetail result={current} passiveCount={passiveCount} />

      {/* Failures */}
      {failures.length > 0 && (
        <details className="failures-section">
          <summary className="failures-toggle">
            {failures.length} incompatible pair{failures.length > 1 ? 's' : ''}
          </summary>
          <ul className="error-list">
            {failures.map((f) => (
              <li key={f.name} className="error-list__item">
                <strong>{f.notableName1}</strong> + <strong>{f.notableName3}</strong>:{' '}
                {f.error}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function ResultDetail({ result, passiveCount = 8 }) {
  const {
    notableName1,
    notableName3,
    notablesBetween,
    notable1,
    notable3,
    validEnchants,
    betweenNames,
  } = result;

  const [showBreakdown, setShowBreakdown] = useState(false);
  const { settings } = useTradeSettings();
  const { priceMap } = usePrices();

  // Price lookup
  const priceInfo = getPriceForCombination(priceMap, notableName1, notableName3, betweenNames);

  // Build MASTER trade link — all valid middles, any enchant
  const masterUrl = buildMasterTradeUrl(
    [notableName1, notableName3],
    betweenNames,
    settings,
    passiveCount
  );

  return (
    <div className="result-detail">
      <div className="result-pair">
        <div className="result-notable">
          <NotableTooltip name={notableName1}>
            <span className="notable-badge notable-badge--desired">{notableName1}</span>
          </NotableTooltip>
          <span className="notable-ilvl">ilvl {notable1.Mod.Level}</span>
        </div>
        <span className="result-separator">+</span>
        <div className="result-notable">
          <NotableTooltip name={notableName3}>
            <span className="notable-badge notable-badge--desired">{notableName3}</span>
          </NotableTooltip>
          <span className="notable-ilvl">ilvl {notable3.Mod.Level}</span>
        </div>
      </div>

      {/* MASTER Trade Link — primary action */}
      <div className="result-section">
        <a
          href={masterUrl}
          target="_blank"
          rel="noreferrer"
          className="trade-link trade-link--master"
        >
          <span className="trade-link__icon">⚡</span>
          <span className="trade-link__content">
            <strong>Search Trade</strong>
            <small>Find cheapest {passiveCount}-passive jewel across all {betweenNames.length} valid middles</small>
          </span>
          {priceInfo && (
            <span className="trade-link__price">
              <span className="price-badge">~{formatPrice(priceInfo.chaosValue, priceInfo.divineValue)}</span>
              {priceInfo.sparkline !== 0 && (
                <span className={`price-trend ${priceInfo.sparkline > 0 ? 'price-trend--up' : 'price-trend--down'}`}>
                  {priceInfo.sparkline > 0 ? '↑' : '↓'}
                </span>
              )}
            </span>
          )}
          <span className="trade-link__arrow">↗</span>
        </a>
      </div>

      {/* Middle notables */}
      <div className="result-section">
        <h4 className="result-section__title">
          Position 2 Options ({betweenNames.length})
        </h4>
        <div className="notable-chips">
          {notablesBetween.map((nObj, idx) => (
            <NotableTooltip key={betweenNames[idx]} name={betweenNames[idx]}>
              <span className="notable-chip notable-chip--middle">
                {betweenNames[idx]}
                <span className="notable-chip__ilvl">ilvl {nObj.Mod.Level}</span>
              </span>
            </NotableTooltip>
          ))}
        </div>
      </div>

      {/* Breakdown trade links — collapsible */}
      <details
        className="breakdown-section"
        open={showBreakdown}
        onToggle={(e) => setShowBreakdown(e.target.open)}
      >
        <summary className="breakdown-toggle">
          Breakdown by enchant ({validEnchants.length} types)
        </summary>
        <div className="trade-links">
          {validEnchants.map((ench) => {
            const matchingMiddles = notablesBetween
              .filter((nObj) => includesEnchant(nObj.Enchantments, ench))
              .map((nObj) => nObj.PassiveSkill.Name);

            if (matchingMiddles.length === 0) return null;

            const enchKey = getEnchantKey(ench);
            const enchantInfo = enchantMap[enchKey];
            const label = enchantInfo ? enchantInfo.text : enchKey;
            const url = buildTradeUrl3n2d(
              [notableName1, notableName3],
              matchingMiddles,
              ench,
              settings,
              passiveCount
            );

            return (
              <a
                key={enchKey}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="trade-link"
              >
                <span className="trade-link__label">{label}</span>
                <span className="trade-link__arrow">↗</span>
              </a>
            );
          })}
        </div>
      </details>
    </div>
  );
}
